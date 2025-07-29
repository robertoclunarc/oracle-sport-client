import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';
import { placeBet, getUserBets } from '../api/bets';

export const BettingContext = createContext();

export const BettingProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [bettingSlip, setBettingSlip] = useState([]);
  const [betAmount, setBetAmount] = useState(100);
  const [totalOdds, setTotalOdds] = useState(0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcular cuotas totales y potencial ganancia cada vez que cambian las selecciones o el monto
  useEffect(() => {
    if (bettingSlip.length === 0) {
      setTotalOdds(0);
      setPotentialWin(0);
      return;
    }

    // Calcular cuotas totales (multiplicación de todas las cuotas en formato decimal)
    let calculatedOdds = 1;
    bettingSlip.forEach(bet => {
      // Convertir las cuotas americanas a decimales
      const decimalOdds = convertAmericanToDecimal(bet.price);
      calculatedOdds *= decimalOdds;
    });

    setTotalOdds(calculatedOdds);
    
    // Calcular potencial ganancia
    const potentialPayout = betAmount * calculatedOdds;
    setPotentialWin(potentialPayout - betAmount);
  }, [bettingSlip, betAmount]);

  // Convertir cuota americana a decimal
  const convertAmericanToDecimal = (americanOdds) => {
    if (americanOdds > 0) {
      return 1 + (americanOdds / 100);
    } else {
      return 1 + (100 / Math.abs(americanOdds));
    }
  };

  // Añadir una selección al boleto de apuestas
  const addToBettingSlip = (selection) => {
    // Verificar si la selección ya existe
    const existingIndex = bettingSlip.findIndex(
      bet => bet.eventId === selection.eventId && bet.marketType === selection.marketType
    );

    if (existingIndex !== -1) {
      // Reemplazar la selección anterior del mismo tipo
      const updatedSlip = [...bettingSlip];
      updatedSlip[existingIndex] = selection;
      setBettingSlip(updatedSlip);
    } else {
      // Añadir nueva selección
      setBettingSlip([...bettingSlip, selection]);
    }
  };

  // Eliminar una selección del boleto
  const removeFromBettingSlip = (id) => {
    setBettingSlip(bettingSlip.filter(bet => bet.id !== id));
  };

  // Limpiar el boleto de apuestas
  const clearBettingSlip = () => {
    setBettingSlip([]);
  };

  // Realizar la apuesta
  const submitBet = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para realizar una apuesta');
      return;
    }

    if (bettingSlip.length === 0) {
      setError('El boleto de apuestas está vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar los datos para la API
      const betData = {
        stakeAmount: betAmount,
        selections: bettingSlip.map(bet => ({
          oddsId: bet.oddsId,
        }))
      };

      // Enviar la apuesta
      const response = await placeBet(betData);
      
      // Limpiar el boleto después de una apuesta exitosa
      clearBettingSlip();
      
      // Actualizar historial de apuestas
      fetchUserBets();
      
      return response;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al realizar la apuesta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de apuestas del usuario
  const fetchUserBets = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    
    try {
      const bets = await getUserBets();
      setUserBets(bets);
    } catch (error) {
      console.error('Error al obtener historial de apuestas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial de apuestas cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBets();
    }
  }, [isAuthenticated]);

  return (
    <BettingContext.Provider value={{
      bettingSlip,
      betAmount,
      totalOdds,
      potentialWin,
      userBets,
      loading,
      error,
      setBetAmount,
      addToBettingSlip,
      removeFromBettingSlip,
      clearBettingSlip,
      submitBet,
      fetchUserBets
    }}>
      {children}
    </BettingContext.Provider>
  );
};

export default BettingContext;