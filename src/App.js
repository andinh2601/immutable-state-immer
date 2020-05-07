import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import Gift from "./components/gift-item";

import {
  getInitialState,
  getBookDetail,
  patchGeneratingGiftsReducer,
} from "./helpers/gift";
import { useSocket } from "./utils/useSocket";

function App() {
  const [state, setState] = useState(() => getInitialState());
  const { users, currentUser, gifts } = state;

  const dispatch = useCallback((action) => {
    setState((currentState) => {
      const [nextState, patches] = patchGeneratingGiftsReducer(
        currentState,
        action
      );
      send(patches);
      return nextState;
    });
    // eslint-disable-next-line
  }, []);

  const send = useSocket("ws://localhost:5001", function onMsg(patches) {
    // we received some patches
    console.dir(patches);
  });

  const handleAdd = () => {
    const description = prompt("Gift to add");

    if (description) {
      dispatch({
        type: "ADD_GIFT",
        payload: {
          id: uuidv4(),
          description,
          image: `https://picsum.photos/id/${Math.round(
            Math.random() * 1000
          )}/200/200`,
        },
      });
    }
  };

  const handleReserve = useCallback((id) => {
    dispatch({
      type: "TOGGLE_RESERVATION",
      payload: {
        id,
      },
    });
    // eslint-disable-next-line
  }, []);

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  const handleAddBook = async () => {
    const isbn = prompt("Enter ISBN number", "0201558025");

    if (isbn) {
      const book = await getBookDetail(isbn);
      dispatch({
        type: "ADD_BOOK",
        payload: { book },
      });
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h2>Hi, {currentUser.name}</h2>
      </div>

      <div className="actions">
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleAddBook}>Add book</button>
      </div>

      <div className="gifts">
        {gifts.map((gift) => (
          <Gift
            key={gift.id}
            users={users}
            currentUser={currentUser}
            gift={gift}
            onReserve={handleReserve}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
