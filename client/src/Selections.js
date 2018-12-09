export function UserTypes(props) {
    console.log(props);
    switch(props.role) {
        case 1: return "System Administrator";
        case 2: return "Travel Manager";
        case 3: return "Driver";
        case 4: return "Requester";
        case 5: return "Travel Admin";
        default: return null;
      }
}

export function TripTypes(props) {
    switch(props.tripType) {
        case 1: return "City Trip";
        case 2: return "Field Trip";
        case 3: return "Field Day Trip";
        case 4: return "Airport";
        default: return "Undefined";
      }
}

export function DriverName(props) {
    if (props.driverTuple[props.driverID] == null) {
        return null;
    } else {
        return props.driverTuple[props.driverID];
    }
}

export function TripStatus(props) {
    switch(props.tripStatus) {
        case 1: return "Pending";
        case 2: return "Assigned";
        case 3: return "Started";
        case 4: return "Completed";
        case 5: return "Cab Assigned";
        case 6: return "Awaiting Approval";
        case 7: return "Cancelled";
        default: return "Error";
    }
}