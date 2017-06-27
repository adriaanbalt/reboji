'use strict';

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import UI from '../lib/UI';
import API from '../redux/API';
import ActionCreator from '../redux/ActionCreator';

class HomePage extends UI {

  render () {
      return (
        <div></div>
      )
  }

};

function mapStateToProps(store) {
  return {
  };
}

HomePage.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(HomePage);
