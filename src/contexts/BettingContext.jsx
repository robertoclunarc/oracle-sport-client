import React, { createContext, useReducer, useEffect } from 'react';

const BettingContext = createContext();

// Actions para el reducer
const ACTIONS = {
  ADD_BET: 'ADD_BET',
  REMOVE_BET: 'REMOVE_BET',
  CLEAR_ALL: 'CLEAR_ALL',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
};

// Reducer para manejar el estado del betting slip
const bettingReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_BET:
      // Verificar si la apuesta ya existe
      const existingBetIndex = state.findIndex(bet => bet.id === action.payload.id);
      
      if (existingBetIndex !== -1) {
        // Si existe, la removemos (toggle behavior)
        return state.filter(bet => bet.id !== action.payload.id);
      } else {
        // Si no existe, la agregamos
        return [...state, action.payload];
      }
      
    case ACTIONS.REMOVE_BET:
      return state.filter(bet => bet.id !== action.payload);
      
    case ACTIONS.CLEAR_ALL:
      return [];
      
    case ACTIONS.LOAD_FROM_STORAGE:
      return action.payload || [];
      
    default:
      return state;
  }
};

export const BettingProvider = ({ children }) => {
  const [bettingSlip, dispatch] = useReducer(bettingReducer, []);

  // Cargar desde localStorage al inicializar
  useEffect(() => {
    const savedBettingSlip = localStorage.getItem('bettingSlip');
    if (savedBettingSlip) {
      try {
        const parsed = JSON.parse(savedBettingSlip);
        dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: parsed });
      } catch (error) {
        console.error('Error parsing betting slip from localStorage:', error);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('bettingSlip', JSON.stringify(bettingSlip));
  }, [bettingSlip]);

  // Funciones del contexto
  const addToBettingSlip = (bet) => {
    dispatch({ type: ACTIONS.ADD_BET, payload: bet });
  };

  const removeBetFromSlip = (betId) => {
    dispatch({ type: ACTIONS.REMOVE_BET, payload: betId });
  };

  const clearBettingSlip = () => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
  };

  const isBetInSlip = (betId) => {
    return bettingSlip.some(bet => bet.id === betId);
  };

  const getTotalOdds = () => {
    return bettingSlip.reduce((total, bet) => {
      const odds = parseFloat(bet.price);
      const decimalOdds = odds >= 0 ? (odds / 100) + 1 : 100 / Math.abs(odds) + 1;
      return total * decimalOdds;
    }, 1);
  };

  const getPotentialPayout = (stakeAmount) => {
    const totalOdds = getTotalOdds();
    return parseFloat(stakeAmount || 0) * totalOdds;
  };

  const contextValue = {
    bettingSlip,
    addToBettingSlip,
    removeBetFromSlip,
    clearBettingSlip,
    isBetInSlip,
    getTotalOdds,
    getPotentialPayout
  };

  return (
    <BettingContext.Provider value={contextValue}>
      {children}
    </BettingContext.Provider>
  );
};

export default BettingContext;