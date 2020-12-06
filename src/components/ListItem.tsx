import React from 'react';
import {IonItem, IonLabel, IonText} from '@ionic/react';
import { FlightProps } from '../model/FlightProps';

interface ItemPropsExt extends FlightProps {
  onEdit: (_id?: string) => void;
}

const ListItem: React.FC<ItemPropsExt> = ({_id, departureTown, arrivalTown, departureTime, arrivalTime, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel className="ion-text-wrap">
                <p>Departure town</p>
                    <IonText>
                    {departureTown}
                </IonText>
                <p>Arrival town</p>
                <IonText>
                    {arrivalTown}
                </IonText>
                    <p>Departure time</p>
                <IonText>
                    {departureTime}
                </IonText>
                    <p>Arrival time</p>
                <IonText>
                    {arrivalTime}
                </IonText>
            </IonLabel>
        </IonItem>
    );
};

export default ListItem;
