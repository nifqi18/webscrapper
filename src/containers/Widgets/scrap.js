import React, { PropTypes } from 'react';
import Preloader from '../../components/Preloader';

export default class MarketScrape extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        load: PropTypes.func,
        status: PropTypes.string

    };
    constructor(props) {
        super(props);
    }
    render() {
        const { children, load, status } = this.props
        return (
            <div className="columns">
                <div className="column is-3">
                    <aside className="menu">
                        <p className="menu-label">
                            SHOOPE
                        </p>
                        <ul className="menu-list">
                            <li><a onClick={() => load()}>BERANDA</a></li>
                            <li><a href="?action=shoope&filter=toko">SCRAPE BERDASARKAN TOKO</a></li>
                        </ul>
                    </aside>
                </div>
                <div className="column is-9">
                    {status === 'start' &&
                        <center>
                            <Preloader />
                        </center>

                    }

                    {children}
                </div>
            </div>
        )
    }
} 