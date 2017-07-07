'use strict';

import React, {
  PropTypes,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import ScrollableMixin from 'react-native-scrollable-mixin';

import cloneReferencedElement from 'react-clone-referenced-element';

type DefaultProps = {
  renderScrollComponent: (props: Object) => ReactElement;
};

let InvertibleScrollView = React.createClass({
  mixins: [ScrollableMixin],

  propTypes: {
    ...ScrollView.propTypes,
    inverted: PropTypes.bool,
    renderScrollComponent: PropTypes.func.isRequired,
  },

  getDefaultProps(): DefaultProps {
    return {
      renderScrollComponent: props => <ScrollView {...props} />,
    };
  },

  getScrollResponder(): ReactComponent {
    if (this._scrollComponent) {
      return this._scrollComponent.getScrollResponder();
    }
    return null;
  },

  setNativeProps(props: Object) {
    if (this._scrollComponent) {
      this._scrollComponent.setNativeProps(props);
    }
  },

  render() {
    var {
      inverted,
      renderScrollComponent,
      ...props,
    } = this.props;

    if (inverted) {
      if (this.props.horizontal) {
        props.style = [styles.horizontallyInverted, props.style];
        props.children = this._renderInvertedChildren(props.children, styles.horizontallyInverted);
      } else {
        props.style = [styles.verticallyInverted, props.style];
        props.children = this._renderInvertedChildren(props.children, styles.verticallyInverted);
      }
    }

    return cloneReferencedElement(renderScrollComponent(props), {
      ref: component => { this._scrollComponent = component; },
    });
  },

  _renderInvertedChildren(children, inversionStyle) {
    return React.Children.map(children, child => {
      return child ? <View style={inversionStyle}>{child}</View> : child;
    });
  },
});

// fix for bug in htc honour which doesnt support negative scaling (gl culling issue?)
// note, this will place scrollbar to the left side of the screen and currently it's not possible
// to set scrollbar alignment in react-native (without forking)
const verticalInvertTransform = Platform.OS === 'android' ? [{ rotateZ:  '180 deg'}] : [{ scaleY:  -1}]

let styles = StyleSheet.create({
  verticallyInverted: {
    transform: verticalInvertTransform,
  },
  horizontallyInverted: {
    transform: [
      { scaleX: -1 },
    ],
  },
});

module.exports = InvertibleScrollView;
