import React, { Component } from 'react';

export default class Benchmark extends Component {
    handleCloseCard = () => {
        this.props.onClose();
    }

    render() {
        return (
            <div style={styles.overlay} onClick={this.handleCloseCard}>
                <div style={styles.benchmarkCard} onClick={(e) => e.stopPropagation()}>
                    <h1 style={styles.h1}>Benchmark</h1>
                </div>
            </div>
        );
    }
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, .7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    benchmarkCard: {
        position: 'fixed',
        borderRadius: '15px',
        height: '60%',
        width: '50%',
        padding: '20px 30px',
        backgroundColor: 'white',
    },
    h1: {
        marginBlockStart: 0,
        marginBlockEnd: '0.37em'
    }
}