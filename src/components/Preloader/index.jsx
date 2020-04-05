import React from 'react';
export default class Preloader extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const styles = require('./preloader.scss')
        return (
            <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
        )
    }
}