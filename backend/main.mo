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
import Migration "migration";

(with migration = Migration.run)
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
    #volunteer;
  };

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

  public type VolunteerProfile = {
    principal : Principal;
    name : Text;
    city : Text;
    active : Bool;
    availabilityStatus : Text;
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
    city : Text;
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

  public type CitywiseStats = {
    city : Text;
    totalKg : Float;
    donationCount : Nat;
  };

  public type SystemAnalytics = {
    totalKgRedistributed : Float;
    totalUsers : Nat;
    totalVolunteers : Nat;
    totalDonations : Nat;
    wasteReducedKg : Float;
    co2SavedKg : Float;
    citywiseStats : [CitywiseStats];
  };

  // ===== Persistent State =====

  var nextDonationId = 0;
  let hotelsStore = Map.empty<Principal, HotelProfile>();
  let ngosStore = Map.empty<Principal, NGOProfile>();
  let volunteersStore = Map.empty<Principal, VolunteerProfile>();
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

  func isVolunteerCaller(caller : Principal) : Bool {
    switch (getAppRole(caller)) {
      case (?#volunteer) { true };
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

  // ===== Volunteer Registration =====

  /// Register the caller as a Volunteer. Requires authenticated user.
  public shared ({ caller }) func registerVolunteer(
    name : Text,
    city : Text,
    availabilityStatus : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to register as a volunteer");
    };
    if (volunteersStore.containsKey(caller)) {
      Runtime.trap("Volunteer already registered for this principal");
    };

    let profile : VolunteerProfile = {
      principal = caller;
      name;
      city;
      active = true;
      availabilityStatus;
    };
    volunteersStore.add(caller, profile);
    storeAppRole(caller, #volunteer);

    let userProfile : UserProfile = {
      appRole = #volunteer;
      displayName = name;
    };
    userProfilesStore.add(caller, userProfile);
  };

  public query ({ caller }) func getMyVolunteerProfile() : async ?VolunteerProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view your volunteer profile");
    };
    volunteersStore.get(caller);
  };

  public shared ({ caller }) func updateVolunteerStatus(active : Bool, availabilityStatus : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to update volunteer status");
    };
    if (not isVolunteerCaller(caller)) {
      Runtime.trap("Unauthorized: Only volunteers can update their status");
    };
    switch (volunteersStore.get(caller)) {
      case (null) { Runtime.trap("Volunteer profile not found") };
      case (?profile) {
        let updated = {
          profile with
          active;
          availabilityStatus;
        };
        volunteersStore.add(caller, updated);
      };
    };
  };

  public query ({ caller }) func listVolunteerAssignments() : async [Donation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view volunteer assignments");
    };
    if (not isVolunteerCaller(caller)) {
      Runtime.trap("Unauthorized: Only volunteers can view their assignments");
    };
    switch (volunteersStore.get(caller)) {
      case (null) { Runtime.trap("Please register as a volunteer first") };
      case (?profile) {
        donationsStore.values().toArray().filter(
          func(d) {
            (d.city == profile.city) and (d.status == #pending or d.status == #matched)
          }
        );
      };
    };
  };

  // ===== Required UserProfile Functions (frontend contract) =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfilesStore.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfilesStore.add(caller, profile);
    storeAppRole(caller, profile.appRole);
  };

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

    let userProfile : UserProfile = {
      appRole = #hotel;
      displayName = name;
    };
    userProfilesStore.add(caller, userProfile);
  };

  // ===== NGO Registration =====

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

    let userProfile : UserProfile = {
      appRole = #ngo;
      displayName = orgName;
    };
    userProfilesStore.add(caller, userProfile);
  };

  // ===== Donation Submission =====

  public shared ({ caller }) func submitDonation(
    foodType : FoodType,
    quantityKg : Float,
    timeSinceCooked : Float,
    storageCondition : StorageCondition,
    pickupAddress : Text,
    pickupDeadline : Time.Time,
    city : Text,
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
      city;
      status;
      spoilageSafe = isSafe;
      submittedAt = Time.now();
    };

    donationsStore.add(nextDonationId, donation);

    switch (matchedNGO) {
      case (?ngoPrincipal) { updateNGOCapacity(ngoPrincipal, quantityKg) };
      case (null) {};
    };

    nextDonationId += 1;
    (isSafe, matchedNGO);
  };

  // ===== NGO Accept/Reject =====

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

        updateNGOCapacity(caller, -donation.quantityKg);

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

        switch (newMatch) {
          case (?ngoPrincipal) { updateNGOCapacity(ngoPrincipal, donation.quantityKg) };
          case (null) {};
        };
      };
    };
  };

  // ===== Admin: Update Donation Status =====

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

  public query ({ caller }) func getHotelAverageRating(hotelPrincipal : Principal) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view hotel ratings");
    };
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

  public query ({ caller }) func listAllUsers() : async ([HotelProfile], [NGOProfile], [VolunteerProfile]) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    let hotels = hotelsStore.values().toArray();
    let ngos = ngosStore.values().toArray();
    let volunteers = volunteersStore.values().toArray();
    (hotels, ngos, volunteers);
  };

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
            switch (volunteersStore.get(principal)) {
              case (?volunteer) {
                volunteersStore.add(principal, { volunteer with active = false });
              };
              case (null) {
                Runtime.trap("User not found");
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func listAllDonations() : async [Donation] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all donations");
    };
    donationsStore.values().toArray();
  };

  public query ({ caller }) func systemAnalytics() : async SystemAnalytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view system analytics");
    };

    var totalKgRedistributed = 0.0;
    var wasteReducedKg = 0.0;
    var totalDonations = 0;

    let cities = [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Aurangabad",
      "Solapur",
      "Thane",
    ];

    let cityStatsMap = Map.empty<Text, (Float, Nat)>();

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

      let cityValid = cities.find(func(c) { c == donation.city });
      switch (cityValid) {
        case (?_) {
          let currentStats = cityStatsMap.get(donation.city);
          let updatedStats = switch (currentStats) {
            case (?stats) {
              (stats.0 + donation.quantityKg, stats.1 + 1);
            };
            case (null) { (donation.quantityKg, 1) };
          };
          cityStatsMap.add(donation.city, updatedStats);
        };
        case (null) {};
      };
    };

    let totalHotels = hotelsStore.size();
    let totalNGOs = ngosStore.size();
    let totalVolunteers = volunteersStore.size();
    let totalUsers = totalHotels + totalNGOs + totalVolunteers;

    let citywiseStats = cities.map(func(city) {
      let stats = cityStatsMap.get(city);
      switch (stats) {
        case (?s) {
          {
            city;
            totalKg = s.0;
            donationCount = s.1;
          };
        };
        case (null) {
          {
            city;
            totalKg = 0.0;
            donationCount = 0;
          };
        };
      };
    });

    {
      totalKgRedistributed;
      totalUsers;
      totalVolunteers;
      totalDonations;
      wasteReducedKg;
      co2SavedKg = totalKgRedistributed * 2.1;
      citywiseStats;
    };
  };

  // ===== Query Endpoints =====

  public query ({ caller }) func getHotelProfile(hotelId : Principal) : async ?HotelProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view hotel profiles");
    };
    hotelsStore.get(hotelId);
  };

  public query ({ caller }) func getNGOProfile(ngoId : Principal) : async ?NGOProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view NGO profiles");
    };
    ngosStore.get(ngoId);
  };

  public query ({ caller }) func getVolunteerProfile(volunteerId : Principal) : async ?VolunteerProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view volunteer profiles");
    };
    volunteersStore.get(volunteerId);
  };

  public query ({ caller }) func getDonation(donationId : Nat) : async ?Donation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view donations");
    };
    donationsStore.get(donationId);
  };

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

  public query ({ caller }) func getMyNGOProfile() : async ?NGOProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isNGOCaller(caller)) {
      Runtime.trap("Unauthorized: Only NGOs can view their own NGO profile");
    };
    ngosStore.get(caller);
  };

  public query ({ caller }) func getMyHotelProfile() : async ?HotelProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isHotelCaller(caller)) {
      Runtime.trap("Unauthorized: Only hotels can view their own hotel profile");
    };
    hotelsStore.get(caller);
  };

  public query ({ caller }) func getMyVolunteerAssignments() : async [Donation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isVolunteerCaller(caller)) {
      Runtime.trap("Unauthorized: Only volunteers can view their assignments");
    };
    switch (volunteersStore.get(caller)) {
      case (?volunteer) {
        donationsStore.values().toArray().filter(
          func(d) {
            (d.city == volunteer.city) and (d.status == #pending or d.status == #matched)
          }
        );
      };
      case (null) { [] };
    };
  };
};
