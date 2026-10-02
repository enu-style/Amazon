import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

// Hook to fetch current user
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, token } = useSelector((state) => state.auth);

  return {
    user,
    isLoading,
    token,
    isAuthenticated: !!token,
  };
};

// Hook to use app notifications/toast
export const useNotification = () => {
  const dispatch = useDispatch();

  const notify = useCallback(
    (message, type = "success", duration = 3000) => {
      // This will be implemented when we set up toast functionality
      console.log(`[${type.toUpperCase()}] ${message}`);
    },
    [dispatch],
  );

  return { notify };
};

// Hook to use pagination
export const usePagination = (initialPage = 1, initialLimit = 12) => {
  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return {
    page,
    limit,
    handlePageChange,
    handleLimitChange,
  };
};

// Hook to handle API errors
export const useApiError = () => {
  const getErrorMessage = useCallback((error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An error occurred";
  }, []);

  return { getErrorMessage };
};

// Hook to debounce values
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Hook to fetch with loading and error states
export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
};

// Hook to manage local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};

// Hook for previous value
export const usePrevious = (value) => {
  const ref = React.useRef();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// Hook for keyboard shortcuts
export const useKeyPress = (targetKey, callback) => {
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === targetKey) {
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [targetKey, callback]);
};
