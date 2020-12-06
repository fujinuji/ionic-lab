import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList, IonLoading,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import { add } from 'ionicons/icons';
import ListItem from './ListItem';
import { getLogger } from '../core';
import { ItemContext } from '../model/FlightsProvider';
import { AuthContext } from '../auth/AuthProvider';
import { FlightProps } from '../model/FlightProps';
import { getItems } from '../api/FlightsApi';

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState<number>(2);
  const { items, fetching, fetchingError } = useContext(ItemContext);
  const [filteredItems, setFilteredItems] = useState<FlightProps[]>([]);
  const { logout } = useContext(AuthContext);
  const [searchText, setSearchText] = useState<string>("");
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
  log('render');

  useEffect(() => setFilteredItems([...(items ? items : [])]), [items]);

  async function fetchData(reset?: boolean) {
    console.log(page);
    const res = await getItems(token, page);
    setFilteredItems([...filteredItems, ...res]);
    //setDisableInfiniteScroll(true);
    setPage(page + 1);
  };

  async function searchNext($event: CustomEvent<void>) {
    console.log("wac");
    /*await fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();*/
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Item List</IonTitle>
          <IonButton onClick={logout}>Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching items" />
        <IonSearchbar onIonChange={(event) => setSearchText(event.detail.value ? event.detail.value : "")}></IonSearchbar>
        {
          filteredItems && (
              <IonList>
                {filteredItems.filter(i => i.arrivalTown.toLocaleLowerCase().startsWith(searchText.toLocaleLowerCase())).map(({_id, departureTown, arrivalTown, departureTime, arrivalTime}) =>
                    <ListItem key={_id} _id={_id} departureTown={departureTown}
                              arrivalTown={arrivalTown}
                              departureTime={departureTime}
                              arrivalTime={arrivalTime}
                              onEdit={(_id: any) => history.push(`/item/${_id}`)}
                    />)}
              </IonList>
          )
        }
        {
          fetchingError && (
              <div>{fetchingError.message || 'Failed to fetch flights'}</div>
          )
        }
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/item')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonInfiniteScroll threshold="10px"
          onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
          <IonInfiniteScrollContent
            loadingText="Loading more good doggos...">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
