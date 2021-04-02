import React, { useRef } from 'react';
import { Route, Switch } from 'react-router-dom';
import Lobby from '../pages/Lobby';
import GameScreen from '../pages/GameScreen';
import CreateGame from '../pages/CreateGame';
import WinScreen from '../pages/WinScreen';
import Api from '../Api';
// import history from '../history';

export default function App() {
  const ws = useRef(null);

  const handleEnterLobby = async () => {
    ws.current = await Api.connectToServer();
    Api.getActiveGames(ws.current);
    console.log('Awaiting server response');
    // history.push('/lobby');
  };

  return (
    <Switch>
      <Route
        path="/createGame/"
        render={() => <CreateGame ws={ws.current} />}
      />
      <Route path="/games/:gameID/win" component={WinScreen} />
      <Route path="/games/:gameID" component={GameScreen} />
      <Route path="/lobby" render={() => <Lobby ws={ws.current} />} />
      <Route
        path="/"
        render={() => (
          <div>
            <div className="pageNavbar">CARDS AGAINST AI</div>
            <div className="pageWrapper">
              <p>
                Lorem ipsum dolor sit amet Mauris at nunc a ante sodales
                blandit. Donec dignissim arcu turpis, quis commodo libero
                lacinia eget. Nunc pulvinar pulvinar lacus at tincidunt.
                Vestibulum vehicula eu libero eget posuere. Donec a consectetur
                magna, nec dictum felis. Duis vitae pellentesque dolor. Mauris
                ac arcu tempus, finibus leo venenatis, lobortis tellus.
                Curabitur finibus, velit sit amet sollicitudin mattis, felis
                dolor bibendum purus, eget feugiat augue dolor et enim. Sed
                accumsan, orci at accumsan iaculis, justo ante vulputate lorem,
                vitae venenatis mi ligula at sem. Cras sed elit quis metus
                consequat bibendum. Pellentesque semper vehicula volutpat.
                Phasellus eu ultrices justo. Donec aliquam lorem orci, quis
                lacinia enim efficitur in. Phasellus lacus tortor, tempus ac
                augue sed, aliquet pharetra dui. Vestibulum ut libero eget
                lectus maximus auctor. Donec venenatis eros et volutpat
                ullamcorper. Integer convallis nibh mi. Nam hendrerit ipsum vel
                nisi fringilla pretium. Sed ac felis dictum, ultrices justo ut,
                porta velit. Sed viverra venenatis eros ut efficitur.
              </p>
              <button
                className="lobbyButton"
                type="button"
                onClick={handleEnterLobby}
              >
                Go to The Lobby
              </button>
            </div>
          </div>
        )}
      />
    </Switch>
  );
}
