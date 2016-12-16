/**
 * This is a HoC that finds a single
 * <video> in a component and makes
 * all its PROPERTIES available as props.
 */
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import toClass from 'recompose/toClass';
import {
    EVENTS,
    PROPERTIES,
} from './constants';

const defaultMapStateToProps = (state = {}) => Object.assign({
    video: {
        ...state
    }
});

const defaultMapVideoElToProps = (videoEl) => ({
    videoEl
});

const defaultMergeProps = (
    stateProps = {},
    videoElProps = {},
    ownProps = {}
) => Object.assign({}, stateProps, videoElProps, ownProps);

export default (
    BaseComponent,
    mapStateToProps = defaultMapStateToProps,
    mapVideoElToProps = defaultMapVideoElToProps,
    mergeProps = defaultMergeProps
) => {
    const BaseComponentClass = toClass(BaseComponent);

    class Video extends Component {
        constructor(props) {
            super(props);
            this.updateState = this.updateState.bind(this);
            this.state = {};
        }

        updateState() {
            this.setState(
                PROPERTIES.reduce((p, c) => {
                    p[c] = this.videoEl && this.videoEl[c];
                    return p;
                }, {})
            );
        }

        bindEventsToUpdateState() {
            EVENTS.forEach(event => {
                this.videoEl[event.toLowerCase()] = this.updateState;
            });
        }

        // Stop `this.el` from being null briefly on every render,
        // see: https://github.com/mderrick/react-html5video/pull/65
        setRef(el) {
            this.el = findDOMNode(el);
        }

        componentDidMount() {
            this.videoEl = this.el.getElementsByTagName('video')[0];
            this.bindEventsToUpdateState();
        }

        render() {
            const stateProps = mapStateToProps(
                this.state,
                this.props
            );
            const videoElProps = mapVideoElToProps(
                this.videoEl,
                this.state,
                this.props
            );
            return (
                <BaseComponentClass
                    ref={this.setRef.bind(this)}
                    {...mergeProps(
                        stateProps,
                        videoElProps,
                        this.props)} />
            );
        }
    }
    return Video;
}
