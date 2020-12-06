import React, { useContext, useEffect, useState } from 'react';
import {Flight} from "../model/Flight";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput, IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from '../model/FlightsProvider';
import { RouteComponentProps } from 'react-router';

const log = getLogger('ItemEdit');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}


const ItemEdit: React.FC<ItemEditProps> = ({history, match}) => {
  const {items, saving, savingError, saveItem} = useContext(ItemContext)
  const [departureTown, setDepartureTown] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTown, setArrivalTown] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [item, setItems] = useState<Flight>();

  useEffect(() => {
    const routeId = match.params.id || '';
    const item = items?.find(it => it._id === routeId);
    setItems(item);
    if (item){
      setDepartureTime(item.departureTime);
      setDepartureTown(item.departureTown);
      setArrivalTown(item.arrivalTown);
      setArrivalTime(item.arrivalTime);
    }
  }, [match.params.id, items]);

  const handleSave = () => {
    const editedItem = item ? { ...item, departureTown, departureTime, arrivalTown, arrivalTime } : { departureTown, departureTime, arrivalTown, arrivalTime}
    saveItem && saveItem(editedItem).then(() => history.goBack());
  }

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLabel>Departure town</IonLabel>
          <IonInput value={departureTown} onIonChange={e => setDepartureTown(e.detail.value || '')}/>
          <IonLabel>Departure time</IonLabel>
          <IonInput value={departureTime} onIonChange={e => setDepartureTime(e.detail.value || '')}/>
          <IonLabel>Arrival town</IonLabel>
          <IonInput value={arrivalTown} onIonChange={e => setArrivalTown(e.detail.value || '')}/>
          <IonLabel>Arrival time</IonLabel>
          <IonInput value={arrivalTime} onIonChange={e => setArrivalTime(e.detail.value || '')}/>
          <IonLoading isOpen={saving} />
          {savingError && (
              <div>{savingError.message || 'Failed to save item'}</div>
          )}
        </IonContent>
      </IonPage>
  );
};
export default ItemEdit;
