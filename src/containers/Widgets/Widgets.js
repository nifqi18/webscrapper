import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import * as widgetActions from 'redux/modules/widgets';
import { isLoaded, load as loadWidgets } from 'redux/modules/widgets';
import { initializeWithKey } from 'redux-form';
// import { WidgetForm } from 'components';
import { asyncConnect } from 'redux-async-connect';
import MarketScrape from './scrap';
const http_file_shope = 'https://cf.shopee.co.id/file/'

@asyncConnect([{
  deferred: true,
  promise: ({ store: { dispatch, getState } }) => {
    if (!isLoaded(getState())) {
      return dispatch(loadWidgets());
    }
  }
}])
@connect(
  state => ({
    widgets: state.widgets.data,
    editing: state.widgets.editing,
    error: state.widgets.error,
    loading: state.widgets.loading
  }),
  { ...widgetActions, initializeWithKey })
export default class Widgets extends Component {
  static propTypes = {
    widgets: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    initializeWithKey: PropTypes.func.isRequired,
    editing: PropTypes.object.isRequired,
    load: PropTypes.func.isRequired,
    editStart: PropTypes.func.isRequired
  };

  state = {
    message: '',
    categorylist: []
  };

  componentDidMount() {
    if (socket) {
      socket.on('shoope', this.onMessageReceived);
      setTimeout(() => {
        socket.emit('history', { offset: 0, length: 100 });
      }, 100);
    }
  }
  componentWillUnmount() {
    if (socket) {
      socket.removeListener('shoope', this.onMessageReceived);
    }
  }

  onMessageReceived = ({ status, data, message }) => {
    // console.log(data)

    if (status === 'start') {
      this.setState({ categorylist: [] })
      return
    }
    if (status === 'parsing_url') {
      this.setState({
        categorylist: data.category_list
      })
      console.log(data)
    }
    this.setState({ message });
  }

  render() {
    console.log(this.state);
    const { categorylist, message } = this.state;
    // const handleEdit = (widget) => {
    //   const { editStart } = this.props; // eslint-disable-line no-shadow
    //   return () => editStart(String(widget.id));
    // };
    const { loading, load } = this.props;

    let refreshClassName = 'fa fa-refresh';
    if (loading) {
      refreshClassName += ' fa-spin';
    }

    const styles = require('./Widgets.scss');
    return (
      <div className={styles.widgets + ' container'}>
        <Helmet title="MarketPlace Online Scrapper" />
        <MarketScrape load={load}>
          {message &&
            <div className="alert alert-danger" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
              {' '}
              {message}
            </div>}

          {categorylist && categorylist.length > 0 && (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className={styles.idCol}>NOMOR</th>
                  <th className={styles.colorCol}>LINK URL</th>
                  <th className={styles.colorCol}>Image</th>
                </tr>
              </thead>
              <tbody>
                {categorylist && categorylist.map((item, index) => (
                  <tr key={index + 1 + 'abs'}>
                    <td className={styles.idCol}>{index + 1}</td>
                    <td className={styles.colorCol}>{item.display_name}</td>
                    <td className={styles.colorCol}>

                      <img src={`${http_file_shope}${item.image}`} width="100" height="100" />
                    </td>
                    {/* <td className={styles.sprocketsCol}>{widget.sprocketCount}</td> */}
                  </tr>
                ))}

              </tbody>

            </table>
          )}
        </MarketScrape>



      </div>
    );
  }
}

