import React from 'react'
import localforage from 'localforage'
import useSwr from 'swr'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Brush, ResponsiveContainer } from 'recharts'

const key = `iiow_live_measures_M1000`

const Chart = ({ dataId }) => {
  const retrieveData = () =>
    localforage.getItem(key).then((storedData) => {
      const data = storedData?.[dataId] ?? []
      let indexes = Array.from(data.I?.keys() ?? [])
      console.log(`Fetched ${indexes.length} measures`)

      return indexes.map((i) => ({
        x: i,
        I: data.I[i],
        V: data.V[i],
        W: data.W[i],
      }))
    })

  const { data, error } = useSwr(key + dataId, retrieveData, {
    refreshInterval: 1000,
    errorRetryCount: 2,
    errorRetryInterval: 1000,
  })

  return error ? (
    <p role="alert">Connection error: {error?.reason ?? error?.message ?? rror}</p>
  ) : !data ? (
    <p role="info">Loading chart...</p>
  ) : (
    <React.Fragment>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          width={500}
          height={200}
          data={data}
          syncId="iiow-live-measures-chart"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="I" stroke="#8884d8" fill="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          width={500}
          height={200}
          data={data}
          syncId="iiow-live-measures-chart"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="V" stroke="#82ca9d" fill="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          width={500}
          height={200}
          data={data}
          syncId="iiow-live-measures-chart"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="W" stroke="#ff7f50" fill="#ff7f50" />
          <Brush />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  )
}

export default Chart
