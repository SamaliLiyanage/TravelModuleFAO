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
        case 3: return "Field One Day";
        case 4: return "Airport";
        default: break;
      }
}