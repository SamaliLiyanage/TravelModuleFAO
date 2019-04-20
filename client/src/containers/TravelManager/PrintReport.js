import React from 'react';

export default class PrintReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reportContent: props.location.state,
        }
    }
    
    render(){
        return (
            <div>Hello</div>
        );   
    };
}
