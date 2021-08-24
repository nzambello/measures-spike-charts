import React, { useState, useEffect } from 'react'
import WebSocket from 'reconnecting-websocket'
import localforage from 'localforage'
import useSwr from 'swr'
import Chart from './Chart'
import './App.css'

const key = `iiow_live_measures_M1000`

function App() {
  const [dataId, setDataId] = useState(null)
  const [connectionError, setConnectionError] = useState(null)

  const handleSocketMockup = () => {
    const socket = new WebSocket('ws://localhost:8000')
    socket.onclose = (err) => setConnectionError(err)

    socket.onmessage = (message) => {
      if (message.data === 'connesso') {
        return
      }
      const { id, marker, ...measures } = JSON.parse(message.data)
      // the key contains also sessionid
      localforage
        .getItem(key)
        .then(function (storedData) {
          let dbValue = storedData || {}

          if (!dbValue[id]) {
            if (marker !== 'start') {
              // this is data from a welding that started before we connected to the websocket, so skip it
              return
            }
            dbValue[id] = measures
          } else {
            dbValue[id].I = dbValue[id].I.concat(measures.I)
            dbValue[id].V = dbValue[id].V.concat(measures.V)
            dbValue[id].W = dbValue[id].W.concat(measures.W)
          }
          localforage.setItem(key, dbValue).then((newValue) => {
            console.log('salvato: ', newValue)
          })
        })
        .catch(function (err) {
          // This code runs if there were any errors
          console.log(err)
          setConnectionError(err)
        })
      console.log('MESSAGGIO: ', JSON.parse(message.data))
    }
  }

  useEffect(() => {
    handleSocketMockup()
  }, [])

  const retrieveDataList = () =>
    localforage.getItem(key).then((storedData) => {
      const dataList = Object.keys(storedData) ?? []
      return dataList
    })

  const { data: dataList, error } = useSwr(key + 'list', retrieveDataList, {
    errorRetryCount: 2,
    errorRetryInterval: 1000,
  })

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live measures! With charts!</h1>
      </header>
      <main role="region">
        {error ? (
          <p role="alert">{error?.message ?? error}</p>
        ) : connectionError ? (
          <p role="alert">Connection error: {connectionError?.reason ?? connectionError?.message ?? connectionError}</p>
        ) : !dataList && !dataId ? (
          <p role="info">Loading chart...</p>
        ) : (
          <React.Fragment>
            <div>
              <select
                onChange={(e) => {
                  let opt = e.target.value
                  if (opt?.length > 0) setDataId(opt)
                  else setDataId(null)
                }}
              >
                <option value=""></option>
                {dataList?.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                )) ?? []}
              </select>
            </div>
            {dataId && <Chart dataId={dataId} />}
          </React.Fragment>
        )}
      </main>
    </div>
  )
}

export default App
