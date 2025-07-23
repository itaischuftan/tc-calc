'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CompensationPackage, CompensationCalculation, LoadingState, ErrorState } from '@/types';
import { CompensationCalculator } from '@/utils/compensation-calculator';

// State interface
interface CompensationState {
  currentPackage: CompensationPackage;
  calculation: CompensationCalculation | null;
  savedPackages: CompensationPackage[];
  loading: LoadingState;
  error: ErrorState;
}

// Action types
type CompensationAction = 
  | { type: 'SET_PACKAGE'; payload: CompensationPackage }
  | { type: 'UPDATE_SALARY'; payload: Partial<CompensationPackage['salary']> }
  | { type: 'UPDATE_BENEFITS'; payload: Partial<CompensationPackage['benefits']> }
  | { type: 'UPDATE_EQUITY'; payload: Partial<CompensationPackage['equity']> }
  | { type: 'UPDATE_PERKS'; payload: Partial<CompensationPackage['perks']> }
  | { type: 'SET_CALCULATION'; payload: CompensationCalculation }
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_ERROR'; payload: ErrorState }
  | { type: 'SAVE_PACKAGE'; payload: CompensationPackage }
  | { type: 'LOAD_SAVED_PACKAGES'; payload: CompensationPackage[] }
  | { type: 'DELETE_PACKAGE'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Default compensation package
const createDefaultPackage = (): CompensationPackage => ({
  id: `package-${Date.now()}`,
  name: 'My Compensation Package',
  createdAt: new Date(),
  updatedAt: new Date(),
  salary: {
    baseSalary: 25000,
    currency: 'ILS',
    frequency: 'monthly'
  },
  benefits: {
    pensionFund: {
      employeeContribution: 6,
      employerContribution: 6
    },
    studyFund: {
      employeeContribution: 2.5,
      employerContribution: 7.5
    },
    healthInsurance: {
      coverage: 'basic',
      employerContribution: 150
    },
    vacationDays: 20,
    sickDays: 'unlimited',
    parentalLeave: 0
  },
  equity: {
    grants: []
  },
  perks: {
    laptop: {
      provided: true,
      annualValue: 8000
    },
    internetStipend: 100,
    phoneStipend: 150,
    gymMembership: 0,
    meals: {
      type: 'none',
      value: 0
    },
    transportation: 0,
    learningBudget: 5000,
    flexibleWork: {
      remoteAllowed: true,
      hybridDays: 3
    }
  }
});

// Initial state
const initialState: CompensationState = {
  currentPackage: createDefaultPackage(),
  calculation: null,
  savedPackages: [],
  loading: { isLoading: false },
  error: { hasError: false }
};

// Reducer
function compensationReducer(state: CompensationState, action: CompensationAction): CompensationState {
  switch (action.type) {
    case 'SET_PACKAGE':
      return {
        ...state,
        currentPackage: { ...action.payload, updatedAt: new Date() }
      };
    
    case 'UPDATE_SALARY':
      return {
        ...state,
        currentPackage: {
          ...state.currentPackage,
          salary: { ...state.currentPackage.salary, ...action.payload },
          updatedAt: new Date()
        }
      };
    
    case 'UPDATE_BENEFITS':
      return {
        ...state,
        currentPackage: {
          ...state.currentPackage,
          benefits: { ...state.currentPackage.benefits, ...action.payload },
          updatedAt: new Date()
        }
      };
    
    case 'UPDATE_EQUITY':
      return {
        ...state,
        currentPackage: {
          ...state.currentPackage,
          equity: { ...state.currentPackage.equity, ...action.payload },
          updatedAt: new Date()
        }
      };
    
    case 'UPDATE_PERKS':
      return {
        ...state,
        currentPackage: {
          ...state.currentPackage,
          perks: { ...state.currentPackage.perks, ...action.payload },
          updatedAt: new Date()
        }
      };
    
    case 'SET_CALCULATION':
      return {
        ...state,
        calculation: action.payload,
        currentPackage: {
          ...state.currentPackage,
          calculations: action.payload
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: { isLoading: false }
      };
    
    case 'SAVE_PACKAGE':
      const updatedPackages = state.savedPackages.filter(p => p.id !== action.payload.id);
      return {
        ...state,
        savedPackages: [...updatedPackages, action.payload]
      };
    
    case 'LOAD_SAVED_PACKAGES':
      return {
        ...state,
        savedPackages: action.payload
      };
    
    case 'DELETE_PACKAGE':
      return {
        ...state,
        savedPackages: state.savedPackages.filter(p => p.id !== action.payload)
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: { hasError: false }
      };
    
    default:
      return state;
  }
}

// Context
const CompensationContext = createContext<{
  state: CompensationState;
  dispatch: React.Dispatch<CompensationAction>;
  calculateCompensation: () => Promise<void>;
  saveCurrentPackage: () => void;
  loadPackage: (packageId: string) => void;
  createNewPackage: () => void;
  updatePackageName: (name: string) => void;
} | undefined>(undefined);

// Provider component
export function CompensationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(compensationReducer, initialState);

  // Load saved packages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('compensation-packages');
      if (saved) {
        const packages = JSON.parse(saved);
        // Convert date strings back to Date objects
        const parsedPackages = packages.map((pkg: CompensationPackage) => ({
          ...pkg,
          createdAt: new Date(pkg.createdAt),
          updatedAt: new Date(pkg.updatedAt)
        }));
        dispatch({ type: 'LOAD_SAVED_PACKAGES', payload: parsedPackages });
      }
    } catch (error) {
      console.error('Error loading saved packages:', error);
    }
  }, []);

  // Save packages to localStorage whenever savedPackages changes
  useEffect(() => {
    try {
      localStorage.setItem('compensation-packages', JSON.stringify(state.savedPackages));
    } catch (error) {
      console.error('Error saving packages:', error);
    }
  }, [state.savedPackages]);

  // Calculate compensation
  const calculateCompensation = async () => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, operation: 'Calculating compensation...' } });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Validate inputs first
      const validation = CompensationCalculator.validateInputs(state.currentPackage);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const calculation = await CompensationCalculator.calculateTotalCompensation(state.currentPackage);
      dispatch({ type: 'SET_CALCULATION', payload: calculation });
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    } catch (error) {
      console.error('Calculation error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          hasError: true, 
          message: error instanceof Error ? error.message : 'Calculation failed',
          code: 'CALCULATION_ERROR'
        } 
      });
    }
  };

  // Save current package
  const saveCurrentPackage = () => {
    const packageToSave = {
      ...state.currentPackage,
      updatedAt: new Date()
    };
    dispatch({ type: 'SAVE_PACKAGE', payload: packageToSave });
  };

  // Load existing package
  const loadPackage = (packageId: string) => {
    const packageToLoad = state.savedPackages.find(p => p.id === packageId);
    if (packageToLoad) {
      dispatch({ type: 'SET_PACKAGE', payload: packageToLoad });
    }
  };

  // Create new package
  const createNewPackage = () => {
    const newPackage = createDefaultPackage();
    dispatch({ type: 'SET_PACKAGE', payload: newPackage });
    dispatch({ type: 'SET_CALCULATION', payload: null as unknown as CompensationCalculation });
  };

  // Update package name
  const updatePackageName = (name: string) => {
    dispatch({ 
      type: 'SET_PACKAGE', 
      payload: { ...state.currentPackage, name } 
    });
  };

  return (
    <CompensationContext.Provider value={{
      state,
      dispatch,
      calculateCompensation,
      saveCurrentPackage,
      loadPackage,
      createNewPackage,
      updatePackageName
    }}>
      {children}
    </CompensationContext.Provider>
  );
}

// Hook to use the context
export function useCompensation() {
  const context = useContext(CompensationContext);
  if (context === undefined) {
    throw new Error('useCompensation must be used within a CompensationProvider');
  }
  return context;
} 