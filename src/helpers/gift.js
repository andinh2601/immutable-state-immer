/* eslint-disable default-case */
import produce, { produceWithPatches, applyPatches } from "immer";
import { allUsers, getCurrentUser } from "../misc/users";
import defaultGifts from "../misc/gifts.json";

const giftsRecipe = (draft, action) => {
  switch (action.type) {
    case "ADD_GIFT":
      const { id, description, image } = action.payload;
      draft.gifts[id] = {
        id,
        description,
        image,
        reservedBy: undefined,
      };
      break;
    case "TOGGLE_RESERVATION":
      const gift = draft.gifts[action.payload.id];
      if (!gift) return;
      gift.reservedBy =
        gift.reservedBy === undefined
          ? draft.currentUser.id
          : gift.reservedBy === draft.currentUser.id
          ? undefined
          : gift.reservedBy;
      break;
    case "ADD_BOOK":
      const { book } = action.payload;
      const isbn = book.identifiers.isbn_10[0];
      draft.gifts[isbn] = {
        id: isbn,
        description: book.title,
        image: book.cover.medium,
        reservedBy: undefined,
      };
      break;
    case "RESET":
      return getInitialState();
    case "APPLY_PATCHES":
      return applyPatches(draft, action.payload.patches);
  }
};

// (state, action) => state
export const giftsReducer = produce(giftsRecipe);

// (state, action) => [nextState, patches, reversePatches]
export const patchGeneratingGiftsReducer = produceWithPatches(giftsRecipe);

export function getInitialState() {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts,
  };
}

// -------------------------------
// ------------ ASYNC ------------
export async function getBookDetail(isbn) {
  const response = await fetch(
    `http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,
    {
      mode: "cors",
    }
  );
  const book = (await response.json())["ISBN:" + isbn];
  return book;
}
