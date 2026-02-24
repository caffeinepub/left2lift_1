import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ===== Types =====

  public type FoodType = {
    #rice;
    #curry;
    #bread;
    #desserts;
    #vegetables;
    #fish;
    #dairy;
    #other;
  };

  public type StorageCondition = {
    #refrigerated;
    #roomTemperature;
    #hot;
  };

  public type DonationStatus = {
    #pending;
    #matched;
    #unmatched;
    #accepted;
    #inTransit;
    #completed;
    #rejected;
  };

  public type AppUserRole = {
    #admin;
    #hotel;
    #ngo;
  };

  // UserProfile required by the instructions frontend contract
  public type UserProfile = {
    appRole : AppUserRole;
    displayName : Text;
  };

  public type HotelProfile = {
    principal : Principal;
    name : Text;
    active : Bool;
  };

  public type NGOProfile = {
    principal : Principal;
    orgName : Text;
    locationAddress : Text;
    foodTypePreferences : [FoodType];
    dailyCapacityKg : Float;
    currentDailyReceivedKg : Float;
    active : Bool;
  };

  public type Donation = {
    id : Nat;
    hotelPrincipal : Principal;
    matchedNGOPrincipal : ?Principal;
    foodType : FoodType;
    quantityKg : Float;
    timeSinceCooked : Float;
    storageCondition : StorageCondition;
    pickupAddress : Text;
    pickupDeadline : Time.Time;
    status : DonationStatus;
    spoilageSafe : Bool;
    submittedAt : Time.Time;
  };

  public type FeedbackRecord = {
    donationId : Nat;
    ngoPrincipal : Principal;
    rating : Nat;
    comment : Text;
  };

  public type SystemAnalytics = {
    totalKgRedistributed : Float;
    totalUsers : Nat;
    totalDonations : Nat;
    wasteReducedKg : Float;
  };

  // ===== Persistent State =====

  var nextDonationId = 0;
  let hotelsStore = Map.empty<Principal, HotelProfile>();
  let ngosStore = Map.empty<Principal, NGOProfile>();
  let donationsStore = Map.empty<Nat, Donation>();
  let feedbacksStore = Map.empty<Nat, FeedbackRecord>();
  let appRolesStore = Map.empty<Principal, AppUserRole>();
  let userProfilesStore = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ===== Internal Helpers =====

  func getAppRole(principal : Principal) : ?AppUserRole {
    appRolesStore.get(principal);
  };

  func storeAppRole(principal : Principal, role : AppUserRole) {
    appRolesStore.add(principal, role);
  };

  func isHotelCaller(caller : Principal) : Bool {
    switch (getAppRole(caller)) {
      case (?#hotel) { true };
      case (_) { false };
    };
  };

  func isNGOCaller(caller : Principal) : Bool {
    switch (getAppRole(caller)) {
      case (?#ngo) { true };
      case (_) { false };
    };
  };

  func predictSpoilage(foodType : FoodType, hours : Float, condition : StorageCondition) : Bool {
    let baseThreshold : Float = switch (condition) {
      case (#refrigerated) { 24.0 };
      case (#roomTemperature) { 6.0 };
      case (#hot) { 4.0 };
    };

    let adjustedThreshold : Float = switch (foodType) {
      case (#fish or #dairy) { baseThreshold - 2.0 };
      case (_) { baseThreshold };
    };

    hours <= adjustedThreshold;
  };

  func matchNGO(foodType : FoodType, quantityKg : Float) : ?Principal {
    var bestScore = -1.0;
    var bestNGO : ?Principal = null;

    for ((ngoPrincipal, ngo) in ngosStore.entries()) {
      if (ngo.active) {
        var score = 0.0;

        let prefIter = ngo.foodTypePreferences.vals();
        var matched = false;
        label prefLoop for (ft in prefIter) {
          if (ft == foodType) {
            matched := true;
            break prefLoop;
          };
        };
        if (matched) {
          score += 10.0;
        };

        let remainingCapacity = ngo.dailyCapacityKg - ngo.currentDailyReceivedKg;
        if (remainingCapacity >= quantityKg) {
          score += remainingCapacity;
          if (score > bestScore) {
            bestScore := score;
            bestNGO := ?ngoPrincipal;
          };
        };
      };
    };
    bestNGO;
  };

  func updateNGOCapacity(ngoPrincipal : Principal, quantityKg : Float) {
    switch (ngosStore.get(ngoPrincipal)) {
      case (?ngo) {
        let updated = {
          ngo with
          currentDailyReceivedKg = ngo.currentDailyReceivedKg + quantityKg
        };
        ngosStore.add(ngoPrincipal, updated);
      };
      case (null) {};
    };
  };

  // ===== Required UserProfile Functions (frontend contract) =====

  /// Get the caller's own UserProfile. Requires authenticated user.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfilesStore.get(caller);
  };

  /// Save the caller's own UserProfile. Requires authenticated user.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfilesStore.add(caller, profile);
    // Also sync the appRole from the profile
    storeAppRole(caller, profile.appRole);
  };

  /// Get another user's profile. Caller can view own profile; admins can view any.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfilesStore.get(user);
  };

  // ===== Role Query =====

  public query ({ caller }) func getCurrentRole() : async ?AppUserRole {
    if (caller.isAnonymous()) {
      return null;
    };
    getAppRole(caller);
  };

  // ===== Hotel Registration =====

  /// Register the caller as a Hotel. Requires authenticated user.
  public shared ({ caller }) func registerHotel(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to register as a hotel");
    };
    if (hotelsStore.containsKey(caller)) {
      Runtime.trap("Hotel already registered for this principal");
    };

    let profile : HotelProfile = {
      principal = caller;
      name;
      active = true;
    };
    hotelsStore.add(caller, profile);
    storeAppRole(caller, #hotel);

    // Also create/update UserProfile
    let userProfile : UserProfile = {
      appRole = #hotel;
      displayName = name;
    };
    userProfilesStore.add(caller, userProfile);
  };

  // ===== NGO Registration =====

  /// Register the caller as an NGO. Requires authenticated user.
  public shared ({ caller }) func registerNGO(
    orgName : Text,
    locationAddress : Text,
    foodTypePreferences : [FoodType],
    dailyCapacityKg : Float,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to register as an NGO");
    };
    if (ngosStore.containsKey(caller)) {
      Runtime.trap("NGO already registered for this principal");
    };

    let profile : NGOProfile = {
      principal = caller;
      orgName;
      locationAddress;
      foodTypePreferences;
      dailyCapacityKg;
      currentDailyReceivedKg = 0.0;
      active = true;
    };
    ngosStore.add(caller, profile);
    storeAppRole(caller, #ngo);

    // Also create/update UserProfile
    let userProfile : UserProfile = {
      appRole = #ngo;
      displayName = orgName;
    };
    userProfilesStore.add(caller, userProfile);
  };

  // ===== Donation Submission =====

  /// Submit a food donation. Only Hotel role users can call this.
  public shared ({ caller }) func submitDonation(
    foodType : FoodType,
    quantityKg : Float,
    timeSinceCooked : Float,
    storageCondition : StorageCondition,
    pickupAddress : Text,
    pickupDeadline : Time.Time,
  ) : async (Bool, ?Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to submit a donation");
    };
    if (not isHotelCaller(caller)) {
      Runtime.trap("Unauthorized: Only hotels can submit donations");
    };

    let isSafe = predictSpoilage(foodType, timeSinceCooked, storageCondition);
    let matchedNGO : ?Principal = if (isSafe) {
      matchNGO(foodType, quantityKg);
    } else { null };

    let status : DonationStatus = switch (matchedNGO) {
      case (null) { if (isSafe) { #unmatched } else { #unmatched } };
      case (_) { #matched };
    };

    let donation : Donation = {
      id = nextDonationId;
      hotelPrincipal = caller;
      matchedNGOPrincipal = matchedNGO;
      foodType;
      quantityKg;
      timeSinceCooked;
      storageCondition;
      pickupAddress;
      pickupDeadline;
      status;
      spoilageSafe = isSafe;
      submittedAt = Time.now();
    };

    donationsStore.add(nextDonationId, donation);

    // Update NGO capacity if matched
    switch (matchedNGO) {
      case (?ngoPrincipal) { updateNGOCapacity(ngoPrincipal, quantityKg) };
      case (null) {};
    };

    nextDonationId += 1;
    (isSafe, matchedNGO);
  };

  // ===== NGO Accept/Reject =====

  /// Accept a donation. Only the matched NGO principal can call this.
  public shared ({ caller }) func acceptDonation(donationId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to accept a donation");
    };
    if (not isNGOCaller(caller)) {
      Runtime.trap("Unauthorized: Only NGOs can accept donations");
    };
    switch (donationsStore.get(donationId)) {
      case (null) { Runtime.trap("Donation does not exist") };
      case (?donation) {
        if (donation.matchedNGOPrincipal != ?caller) {
          Runtime.trap("Unauthorized: Only the matched NGO can accept this donation");
        };
        let updatedDonation = { donation with status = #accepted };
        donationsStore.add(donationId, updatedDonation);
      };
    };
  };

  /// Reject a donation and attempt re-matching. Only the matched NGO principal can call this.
  public shared ({ caller }) func rejectDonation(donationId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to reject a donation");
    };
    if (not isNGOCaller(caller)) {
      Runtime.trap("Unauthorized: Only NGOs can reject donations");
    };
    switch (donationsStore.get(donationId)) {
      case (null) { Runtime.trap("Donation does not exist") };
      case (?donation) {
        if (donation.matchedNGOPrincipal != ?caller) {
          Runtime.trap("Unauthorized: Only the matched NGO can reject this donation");
        };

        // Restore NGO capacity before re-matching
        updateNGOCapacity(caller, -donation.quantityKg);

        // Attempt re-matching excluding the rejecting NGO
        // Simple re-match: find next best NGO
        let newMatch = matchNGO(donation.foodType, donation.quantityKg);
        let newStatus : DonationStatus = switch (newMatch) {
          case (null) { #unmatched };
          case (_) { #matched };
        };

        let updatedDonation = {
          donation with
          status = newStatus;
          matchedNGOPrincipal = newMatch;
        };
        donationsStore.add(donationId, updatedDonation);

        // Update new NGO capacity if re-matched
        switch (newMatch) {
          case (?ngoPrincipal) { updateNGOCapacity(ngoPrincipal, donation.quantityKg) };
          case (null) {};
        };
      };
    };
  };

  // ===== Admin: Update Donation Status =====

  /// Update any donation's status. Admin only.
  public shared ({ caller }) func updateDonationStatus(donationId : Nat, newStatus : DonationStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update donation status");
    };
    switch (donationsStore.get(donationId)) {
      case (null) { Runtime.trap("Donation does not exist") };
      case (?donation) {
        let updatedDonation = { donation with status = newStatus };
        donationsStore.add(donationId, updatedDonation);
      };
    };
  };

  // ===== Feedback =====

  /// Submit feedback for a completed donation. Only NGO role users can call this.
  public shared ({ caller }) func submitFeedback(donationId : Nat, rating : Nat, comment : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to submit feedback");
    };
    if (not isNGOCaller(caller)) {
      Runtime.trap("Unauthorized: Only NGOs can submit feedback");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    switch (donationsStore.get(donationId)) {
      case (null) { Runtime.trap("Donation does not exist") };
      case (?donation) {
        if (donation.status != #completed) {
          Runtime.trap("Feedback can only be submitted for completed donations");
        };
        let feedback : FeedbackRecord = {
          donationId;
          ngoPrincipal = caller;
          rating;
          comment;
        };
        feedbacksStore.add(donationId, feedback);
      };
    };
  };

  /// Get average rating for a hotel based on feedback on its completed donations.
  public query ({ caller }) func getHotelAverageRating(hotelPrincipal : Principal) : async Float {
    var total = 0;
    var count = 0;
    for ((_, feedback) in feedbacksStore.entries()) {
      switch (donationsStore.get(feedback.donationId)) {
        case (?donation) {
          if (donation.hotelPrincipal == hotelPrincipal) {
            total += feedback.rating;
            count += 1;
          };
        };
        case (null) {};
      };
    };

    if (count == 0) { 0.0 } else { total.toFloat() / count.toFloat() };
  };

  // ===== Admin Endpoints =====

  /// List all hotel and NGO profiles. Admin only.
  public query ({ caller }) func listAllUsers() : async ([HotelProfile], [NGOProfile]) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    let hotels = hotelsStore.values().toArray();
    let ngos = ngosStore.values().toArray();
    (hotels, ngos);
  };

  /// Deactivate a user (hotel or NGO). Admin only.
  public shared ({ caller }) func deactivateUser(principal : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can deactivate users");
    };
    switch (hotelsStore.get(principal)) {
      case (?hotel) {
        hotelsStore.add(principal, { hotel with active = false });
      };
      case (null) {
        switch (ngosStore.get(principal)) {
          case (?ngo) {
            ngosStore.add(principal, { ngo with active = false });
          };
          case (null) {
            Runtime.trap("User not found");
          };
        };
      };
    };
  };

  /// List all donations with enriched info. Admin only.
  public query ({ caller }) func listAllDonations() : async [Donation] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all donations");
    };
    donationsStore.values().toArray();
  };

  /// System analytics. Admin only.
  public query ({ caller }) func systemAnalytics() : async SystemAnalytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view system analytics");
    };

    var totalKgRedistributed = 0.0;
    var wasteReducedKg = 0.0;
    var totalDonations = 0;

    for ((_, donation) in donationsStore.entries()) {
      totalDonations += 1;
      if (donation.status == #completed) {
        totalKgRedistributed += donation.quantityKg;
      };
      if (
        donation.status == #unmatched or
        donation.status == #rejected or
        not donation.spoilageSafe
      ) {
        wasteReducedKg += donation.quantityKg;
      };
    };

    let totalHotels = hotelsStore.size();
    let totalNGOs = ngosStore.size();
    let totalUsers = totalHotels + totalNGOs;

    {
      totalKgRedistributed;
      totalUsers;
      totalDonations;
      wasteReducedKg;
    };
  };

  // ===== Query Endpoints =====

  /// Get a hotel profile. Any authenticated user can view.
  public query ({ caller }) func getHotelProfile(hotelId : Principal) : async ?HotelProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view hotel profiles");
    };
    hotelsStore.get(hotelId);
  };

  /// Get an NGO profile. Any authenticated user can view.
  public query ({ caller }) func getNGOProfile(ngoId : Principal) : async ?NGOProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view NGO profiles");
    };
    ngosStore.get(ngoId);
  };

  /// Get a donation record. Any authenticated user can view.
  public query ({ caller }) func getDonation(donationId : Nat) : async ?Donation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view donations");
    };
    donationsStore.get(donationId);
  };

  /// Get all donations for the calling hotel. Hotel role only.
  public query ({ caller }) func getMyHotelDonations() : async [Donation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isHotelCaller(caller)) {
      Runtime.trap("Unauthorized: Only hotels can view their own donations");
    };
    let result = donationsStore.values().toArray().filter(
      func(d) { d.hotelPrincipal == caller }
    );
    result;
  };

  /// Get all donations matched to the calling NGO. NGO role only.
  public query ({ caller }) func getMyNGODonations() : async [Donation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isNGOCaller(caller)) {
      Runtime.trap("Unauthorized: Only NGOs can view their matched donations");
    };
    let result = donationsStore.values().toArray().filter(
      func(d) { d.matchedNGOPrincipal == ?caller }
    );
    result;
  };

  /// Get the calling NGO's own profile. NGO role only.
  public query ({ caller }) func getMyNGOProfile() : async ?NGOProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isNGOCaller(caller)) {
      Runtime.trap("Unauthorized: Only NGOs can view their own NGO profile");
    };
    ngosStore.get(caller);
  };

  /// Get the calling hotel's own profile. Hotel role only.
  public query ({ caller }) func getMyHotelProfile() : async ?HotelProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isHotelCaller(caller)) {
      Runtime.trap("Unauthorized: Only hotels can view their own hotel profile");
    };
    hotelsStore.get(caller);
  };
};
