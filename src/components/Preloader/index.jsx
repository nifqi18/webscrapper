import React from 'react';
export default class Preloader extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const styles = require('./Preloader.scss')
        return (
            <div className={styles.ldsRing}><div></div><div></div><div></div><div></div></div>
        )
    }
}