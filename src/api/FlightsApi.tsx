import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { FlightProps } from '../model/FlightProps';
import {Plugins} from "@capacitor/core";
import {key} from "ionicons/icons";

const { Storage } = Plugins;
const itemUrl = `http://${baseUrl}/api/flight`;

export const getItems: (token: string, page: number) => Promise<FlightProps[]> = (token, page) => {
  try {
    var result = axios.get(`${itemUrl}?page=${page}`, authConfig(token));

    result.then(function (result) {
      result.data.forEach(async (flight: FlightProps) => {
        await Storage.set({
          key: flight._id!,
          value: JSON.stringify({
            _id: flight._id,
            departureTown: flight.departureTown,
            departureTime: flight.departureTime,
            arrivalTown: flight.arrivalTown,
            arrivalTime: flight.arrivalTime
          }),
        });
      });
    });

    return withLogs(result, "getItems");
  } catch (e) {
    console.log("eroare", e)
  }

  return withLogs(Promise.reject(), "getItems");
}

export const createItem: (token: string, item: FlightProps) => Promise<FlightProps[]> = (token, item) => {
  return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
}

export const updateItem: (token: string, item: FlightProps) => Promise<FlightProps[]> = (token, item) => {
  return withLogs(axios.put(`${itemUrl}/${item._id}`, item, authConfig(token)), 'updateItem');
}

interface MessageData {
  type: string;
  payload: FlightProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}

const clearStorage = async () => {
  const allKeys = Storage.keys();
  var i;

  await allKeys.then(function (allKeys) {
    for (i = 0; i < allKeys.keys.length; ++i) {
      if (allKeys.keys[i] !== "_id" && allKeys.keys[i] !== "user_token") {
        console.log(allKeys.keys[i])
        Storage.remove({key: allKeys.keys[i]});
      }
    }
  })
}
