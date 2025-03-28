
import { useState, useEffect, useMemo } from 'react';
import { Institution, FilterOptions, SearchState } from './types';
import axios from 'axios';

export const useInstitutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {
      location: [],
      type: [],
      entryRequirements: [],
      coursesOffered: [],
      coCurricularActivities: [],
      specialPrograms: [],
    }
  });
  
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data from the API
  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/institutions/getall');
        
        // Check if the response contains the expected data
        if (response.data && Array.isArray(response.data.data)) {
          setInstitutions(response.data.data);
        } else if (Array.isArray(response.data)) {
          setInstitutions(response.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch institutions:', err);
        setError('Failed to load institutions. Please try again later.');
        
        // Fallback to mock data in case API fails
        import('./mockData').then((mockModule) => {
          console.log('Falling back to mock data...');
          setInstitutions(mockModule.institutions);
          setError('Using mock data (API unavailable)');
        }).catch((mockErr) => {
          console.error('Failed to load mock data:', mockErr);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutions();
  }, []);
  
  const filteredInstitutions = useMemo(() => {
    const { query, filters } = searchState;
    
    return institutions.filter(institution => {
      // Filter by search query
      if (query && !institution.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      // Filter by location
      if (filters.location.length > 0 && !filters.location.includes(institution.location)) {
        return false;
      }
      
      // Filter by type
      if (filters.type.length > 0 && !filters.type.includes(institution.type)) {
        return false;
      }
      
      // Filter by entry requirements - match any
      if (filters.entryRequirements.length > 0 && 
          !institution.entryRequirements.some(req => filters.entryRequirements.includes(req))) {
        return false;
      }
      
      // Filter by courses offered - match any
      if (filters.coursesOffered.length > 0 && 
          !institution.coursesOffered.some(course => filters.coursesOffered.includes(course))) {
        return false;
      }
      
      // Filter by co-curricular activities - match any
      if (filters.coCurricularActivities.length > 0 && 
          !institution.coCurricularActivities.some(activity => 
            filters.coCurricularActivities.includes(activity))) {
        return false;
      }
      
      // Filter by special programs - match any
      if (filters.specialPrograms.length > 0 && 
          !institution.specialPrograms.some(program => 
            filters.specialPrograms.includes(program))) {
        return false;
      }
      
      // Filter by ranking
      if (filters.minRanking !== undefined && 
          institution.ranking && 
          institution.ranking < filters.minRanking) {
        return false;
      }
      
      if (filters.maxRanking !== undefined && 
          institution.ranking && 
          institution.ranking > filters.maxRanking) {
        return false;
      }
      
      return true;
    });
  }, [searchState, institutions]);
  
  const updateSearchQuery = (query: string) => {
    setSearchState(prev => ({
      ...prev,
      query
    }));
  };
  
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      }
    }));
  };
  
  const resetFilters = () => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        location: [],
        type: [],
        entryRequirements: [],
        coursesOffered: [],
        coCurricularActivities: [],
        specialPrograms: [],
      }
    }));
  };
  
  return {
    institutions: filteredInstitutions,
    isLoading,
    error,
    selectedInstitution,
    setSelectedInstitution,
    searchState,
    updateSearchQuery,
    updateFilters,
    resetFilters
  };
};
