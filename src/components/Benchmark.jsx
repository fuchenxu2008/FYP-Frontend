import React, { Component } from 'react';
import Chart from './Chart.jsx';

export default class Benchmark extends Component {
    state = {
        current: 'route',
    }

    _handleCloseCard = () => {
        this.props.onClose();
    }

    _switchChart = (current) => {
        this.setState({ current });
    }

    render() {
        const { benchmark } = this.props;
        const { current } = this.state;
        console.log('current: ', current);
        const data = Object.keys(benchmark).map(algo => benchmark[algo])

        return (
            <div style={styles.overlay} onClick={this._handleCloseCard}>
                <div style={styles.benchmarkCard} onClick={(e) => e.stopPropagation()}>
                    <h1 style={styles.h1}>Benchmark</h1>
                    <div style={styles.buttonGroup}>
                        <button onClick={() => this._switchChart('route')} style={current === 'route' ? styles.selectedBtn : styles.button}>Route</button>
                        <button onClick={() => this._switchChart('runTime')} style={current === 'runTime' ? styles.selectedBtn : styles.button}>RunTime</button>
                        <button onClick={() => this._switchChart('traversed')} style={current === 'traversed' ? styles.selectedBtn : styles.button}>Traversed</button>
                    </div>
                    {
                        data.length
                        ? (
                            <div style={styles.chartContainer}>
                                {current === 'route' && <Chart data={data} dataKeys={['cost', 'distance']} />}
                                {current === 'runTime' && <Chart data={data} dataKeys={['runTime']} />}
                                {current === 'traversed' && <Chart data={data} dataKeys={['traversed']} />}
                            </div>
                        )
                        : (
                            <div style={styles.loading}>
                                <b>Loading...</b>
                            </div>
                        )  
                    }
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
        height: '70%',
        width: '70%',
        padding: '20px 30px',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    chartContainer: {
        flex: 1,
    },
    h1: {
        marginBlockStart: 0,
        marginBlockEnd: '0.37em'
    },
    loading: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonGroup: {
        marginBlockEnd: '1em'
    },
    button: {
        border: 'none',
        borderRadius: '15px',
        padding: '5px 15px',
        fontSize: '15px',
        margin: '3px 10px 3px 0',
        color: 'rgb(50, 50, 50)',
        backgroundColor: 'white',
        cursor: 'pointer',
        outline: 0,
    },
    selectedBtn: {
        border: 'none',
        borderRadius: '15px',
        padding: '5px 15px',
        fontSize: '15px',
        margin: '3px 10px 3px 0',
        cursor: 'pointer',
        outline: 0,
        backgroundColor: '#3b9cff',
        color: 'white',
    }
}