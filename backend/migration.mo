import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type OldFoodType = {
    #rice;
    #curry;
    #bread;
    #desserts;
    #vegetables;
    #fish;
    #dairy;
    #other;
  };
  type OldStorageCondition = {
    #refrigerated;
    #roomTemperature;
    #hot;
  };
  type OldDonationStatus = {
    #pending;
    #matched;
    #unmatched;
    #accepted;
    #inTransit;
    #completed;
    #rejected;
  };
  type OldAppUserRole = {
    #admin;
    #hotel;
    #ngo;
  };
  type OldUserProfile = {
    appRole : OldAppUserRole;
    displayName : Text;
  };
  type OldHotelProfile = {
    principal : Principal.Principal;
    name : Text;
    active : Bool;
  };
  type OldNGOProfile = {
    principal : Principal.Principal;
    orgName : Text;
    locationAddress : Text;
    foodTypePreferences : [OldFoodType];
    dailyCapacityKg : Float;
    currentDailyReceivedKg : Float;
    active : Bool;
  };
  type OldDonation = {
    id : Nat;
    hotelPrincipal : Principal.Principal;
    matchedNGOPrincipal : ?Principal.Principal;
    foodType : OldFoodType;
    quantityKg : Float;
    timeSinceCooked : Float;
    storageCondition : OldStorageCondition;
    pickupAddress : Text;
    pickupDeadline : Time.Time;
    status : OldDonationStatus;
    spoilageSafe : Bool;
    submittedAt : Time.Time;
  };
  type OldActor = {
    hotelsStore : Map.Map<Principal.Principal, OldHotelProfile>;
    ngosStore : Map.Map<Principal.Principal, OldNGOProfile>;
    donationsStore : Map.Map<Nat, OldDonation>;
    appRolesStore : Map.Map<Principal.Principal, OldAppUserRole>;
    userProfilesStore : Map.Map<Principal.Principal, OldUserProfile>;
  };

  func mapFoodType(old : OldFoodType) : { #rice; #vegetables; #bread; #desserts; #other; #curry; #fish; #dairy } {
    switch (old) {
      case (#rice) { #rice };
      case (#vegetables) { #vegetables };
      case (#bread) { #bread };
      case (#desserts) { #desserts };
      case (#other) { #other };
      case (#curry) { #curry };
      case (#fish) { #fish };
      case (#dairy) { #dairy };
    };
  };

  func mapStorageCondition(old : OldStorageCondition) : { #refrigerated; #roomTemperature; #hot } {
    switch (old) {
      case (#refrigerated) { #refrigerated };
      case (#roomTemperature) { #roomTemperature };
      case (#hot) { #hot };
    };
  };

  func mapDonationStatus(old : OldDonationStatus) : { #pending; #matched; #unmatched; #accepted; #inTransit; #completed; #rejected } {
    switch (old) {
      case (#pending) { #pending };
      case (#matched) { #matched };
      case (#unmatched) { #unmatched };
      case (#accepted) { #accepted };
      case (#inTransit) { #inTransit };
      case (#completed) { #completed };
      case (#rejected) { #rejected };
    };
  };

  func mapAppUserRole(old : OldAppUserRole) : { #admin; #hotel; #ngo; #volunteer } {
    switch (old) {
      case (#admin) { #admin };
      case (#hotel) { #hotel };
      case (#ngo) { #ngo };
    };
  };

  public func run(old : OldActor) : {
    hotelsStore : Map.Map<Principal.Principal, OldHotelProfile>;
    ngosStore : Map.Map<Principal.Principal, OldNGOProfile>;
    donationsStore : Map.Map<Nat, {
      id : Nat;
      hotelPrincipal : Principal.Principal;
      matchedNGOPrincipal : ?Principal.Principal;
      foodType : OldFoodType;
      quantityKg : Float;
      timeSinceCooked : Float;
      storageCondition : OldStorageCondition;
      pickupAddress : Text;
      pickupDeadline : Time.Time;
      status : OldDonationStatus;
      spoilageSafe : Bool;
      submittedAt : Time.Time;
      city : Text;
    }>;
    appRolesStore : Map.Map<Principal.Principal, { #admin; #hotel; #ngo; #volunteer }>;
    userProfilesStore : Map.Map<Principal.Principal, {
      appRole : { #admin; #hotel; #ngo; #volunteer };
      displayName : Text;
    }>;
    volunteersStore : Map.Map<Principal.Principal, {
      principal : Principal.Principal;
      name : Text;
      city : Text;
      active : Bool;
      availabilityStatus : Text;
    }>;
  } {
    let newDonationsStore = old.donationsStore.map<Nat, OldDonation, {
      id : Nat;
      hotelPrincipal : Principal.Principal;
      matchedNGOPrincipal : ?Principal.Principal;
      foodType : OldFoodType;
      quantityKg : Float;
      timeSinceCooked : Float;
      storageCondition : OldStorageCondition;
      pickupAddress : Text;
      pickupDeadline : Time.Time;
      status : OldDonationStatus;
      spoilageSafe : Bool;
      submittedAt : Time.Time;
      city : Text;
    }>(
      func(_id, oldDonation) {
        {
          oldDonation with
          city = "Mumbai";
        };
      }
    );

    let newAppRolesStore = old.appRolesStore.map<Principal.Principal, OldAppUserRole, { #admin; #hotel; #ngo; #volunteer }>(
      func(_p, oldRole) { mapAppUserRole(oldRole) }
    );

    let newUserProfilesStore = old.userProfilesStore.map<Principal.Principal, OldUserProfile, {
      appRole : { #admin; #hotel; #ngo; #volunteer };
      displayName : Text;
    }>(
      func(_p, oldProfile) {
        {
          oldProfile with
          appRole = mapAppUserRole(oldProfile.appRole);
        };
      }
    );

    let initialEmptyVolunteers = Map.empty<Principal.Principal, {
      principal : Principal.Principal;
      name : Text;
      city : Text;
      active : Bool;
      availabilityStatus : Text;
    }>();
    {
      old with
      donationsStore = newDonationsStore;
      appRolesStore = newAppRolesStore;
      userProfilesStore = newUserProfilesStore;
      volunteersStore = initialEmptyVolunteers;
    };
  };
};
