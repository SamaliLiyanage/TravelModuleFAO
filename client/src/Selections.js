export function UserTypes(props) {
    switch(props.role) {
        case 1: return "System Administrator";
        case 2: return "Travel Manager";
        case 3: return "Driver";
        case 4: return "Requester";
        default: break;
      }
}

export function TripTypes(props) {
    switch(props.tripType) {
        case 1: return "Day Trip";
        case 2: return "Field Trip";
        case 3: return "Field Day Trip";
        case 4: return "Airport";
        default: break;
      }
}

export function DriverName(props) {
    switch(props.driverID) {
        case '1': return "Driver 1";
        case '2': return "Driver 2";
        case '3': return "Driver 3";
        case 'cab': return "Cab Assigned"
        default: return "Unassigned";
    }
}

export function TripStatus(props) {
    switch(props.tripStatus) {
        case 1: return "Pending";
        case 2: return "Assigned";
        case 3: return "Completed";
        case 4: return "Cancelled";
        case 5: return "Cab Assigned";
        default: break;
    }
}