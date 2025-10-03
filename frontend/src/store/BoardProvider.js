import { useCallback, useReducer } from "react";
import boardContext from "./board-context";
import { TOOL_ITEMS, TOOL_ACTION_TYPES, BOARD_ACTIONS } from "../constants";
import { createElement, isPointNearElement } from "../utils/elements";
import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/elements";

function boardReducer(state, action) {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    }
    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }
    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;
      const newElement = createElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );
      const prevElements = state.elements;
      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: [...prevElements, newElement],
      };
    }
    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const index = state.elements.length - 1;
      const { type } = newElements[index];
      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          const { x1, y1, stroke, fill, size } = newElements[index];
          newElements[index] = createElement(index, x1, y1, clientX, clientY, {
            type: state.activeToolItem,
            stroke,
            fill,
            size,
          });
          break;
        case TOOL_ITEMS.BRUSH:
          newElements[index].points = [
            ...newElements[index].points,
            { x: clientX, y: clientY },
          ];
          newElements[index].path = new Path2D(
            getSvgPathFromStroke(getStroke(newElements[index].points))
          );
          break;
        default:
          break;
      }

      return {
        ...state,
        elements: newElements,
      };
    }
    case BOARD_ACTIONS.DRAW_UP: {
      const elementsCopy = [...state.elements];
      let newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(elementsCopy);
      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;
      const newElements = state.elements.filter(
        (element) => !isPointNearElement(element, clientX, clientY)
      );
      if (newElements.length === state.elements.length) return state;
      let newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);
      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.CHANGE_TEXT: {
      const { text } = action.payload;
      let newElements = [...state.elements];
      const index = state.elements.length - 1;
      newElements[index].text = text;
      let newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);
      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }
    case BOARD_ACTIONS.UNDO: {
      if (state.index === 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1],
        index: state.index - 1,
      };
    }
    case BOARD_ACTIONS.REDO: {
      if (state.index + 1 === state.history.length) return state;
      return {
        ...state,
        elements: state.history[state.index + 1],
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.SET_CANVAS_ELEMENTS:
      return {
        ...state,
        elements: action.payload.elements,
      };
    default:
      return state;
  }
}

/*
const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
};
*/

const BoardProvider = ({ children, initialCanvas }) => {
  const initialBoardState = {
    activeToolItem: TOOL_ITEMS.BRUSH,
    toolActionType: TOOL_ACTION_TYPES.NONE,
    elements: initialCanvas?.elements || [],
    history: [initialCanvas?.elements ?? []],
    index: 0,
  };

  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );

  const changeToolHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool,
      },
    });
  };

  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size,
      },
    });
  };

  const boardMouseMoveHandler = (event) => {
    const { clientX, clientY } = event;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: { clientX, clientY },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: { clientX, clientY },
      });
    }
  };

  const boardMouseUpHandler = () => {
    if (boardState.activeToolItem === TOOL_ITEMS.TEXT) return;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
        payload: {
          actionType: TOOL_ACTION_TYPES.NONE,
        },
      });
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  };

  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
  };

  const setElements = (elements) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.SET_CANVAS_ELEMENTS,
      payload: {
        elements,
      },
    });
  };

  const boardUndoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  }, []);

  const boardRedoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  }, []);

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    toolActionType: boardState.toolActionType,
    elements: boardState.elements,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo: boardUndoHandler,
    redo: boardRedoHandler,
    setElements,
  };

  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;
