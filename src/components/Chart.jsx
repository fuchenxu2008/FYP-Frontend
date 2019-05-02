import React, { Component } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default class Chart extends Component {
  render() {
    const { data, dataKeys = [] } = this.props;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} strokeDasharray="3 3">
          {dataKeys.map((dataKey, i) => (
            <Bar
              key={dataKey}
              type="monotone"
              dataKey={dataKey}
              fill={['#82ca9d', '#8884d8', '#FC5B60', '#42B2CE'][i]}
              barSize={45}
            />
          ))}
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={false} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
