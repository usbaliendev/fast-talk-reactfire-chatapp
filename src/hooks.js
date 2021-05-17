import { useEffect, useState, useRef, useCallback } from 'react';

export function useFirestoreQuery(query) {
  const [docs, setDocs] = useState([]);

  // Armazena a query no ref
  const queryRef = useRef(query);

  // Compara a query atual com a anterior.
  useEffect(() => {
    // Usa o metodo herdado do Firestore 'isEqual'
    // para comparar as queries.
    if (!queryRef?.curent?.isEqual(query)) {
      queryRef.current = query;
    }
  });

  // Executa novamente o leitor da data apenas se a query mudar.
  useEffect(() => {
    if (!queryRef.current) {
      return null;
    }

    // Inscrição no query com onSnapshot
    const unsubscribe = queryRef.current.onSnapshot(querySnapshot => {
      // Pega todos os dados da coleção com os IDs.
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      // Atualiza o estado
      setDocs(data);
    });

    // Disconecta o registrador de eventos
    return unsubscribe;
  }, [queryRef]);

  return docs;
}

export function useAuthState(auth) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(() => auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
      } else {
        setUser(false);
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    // Limpa o log de entrada.
    return unsubscribe;
  }, [auth, initializing]);

  return { user, initializing };
}

export function useLocalStorage(key, initialValue) {
  // Instanciona pra armazenar o valor
  // Passa o valor inicial da funcao useState para que a logica seja executada apenas uma vez.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Adquire do armazenamento local pela chave
      const item = window.localStorage.getItem(key);
      // Faz o parsing do json armazenado ou se nao tem valor retorna initialValue.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se der erro retorna o initialValue.
      console.log(error);
      return initialValue;
    }
  });

  // Retorna uma versão envolucra do setter da que ...
  // ... mantem o novo valor no armazenamentoLocal.
  const setValue = value => {
    try {
      // Permite ao valor ser uma funçãom, temos a mesma API que useState.
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Salva o estado
      setStoredValue(valueToStore);
      // Salva no armazenamento local.
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Uma implementacao mais avancada pode solucionar os erros de caso.
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export function useMedia(queries, values, defaultValue) {
  // Array contendo a lista de query contento cada query.
  const mediaQueryLists = queries.map(q => window.matchMedia(q));

  // Funcao que recebe o valor baseado na query de media correspondente. 
  const getValue = useCallback(() => {
    // Recebe o index da priemeiura midia d query que tem valor correspondente.
    const index = mediaQueryLists.findIndex(mql => mql.matches);
    // Retorna o valor relacionado ou valor padrao se none.
    return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
  }, [mediaQueryLists, values, defaultValue]);

  // Estado e setter para o valor correspondente.
  const [value, setValue] = useState(getValue);

  useEffect(() => {
    // Puxa o historico de eventos pelo callback
    // Nota: Ao definir getValue fora do useEffect se garante que tenha ...
    // ... os valores dos argumentos dos hooks/ganchos( o gancho de historico é cosntruido quando se monta a pagina).
    const handler = () => setValue(getValue);
    // Seta um registrador para cada media query com o handler que puxa o historico de mensagens.
    mediaQueryLists.forEach(mql => mql.addListener(handler));
    // Remove os leitores no cleanup
    return () => mediaQueryLists.forEach(mql => mql.removeListener(handler));
  }, [getValue, mediaQueryLists]);

  return value;
}

export function useDarkMode() {
  // Check se os usuarios tem setado um navegador de preferencia com o dark mode.
  const prefersDarkMode = useMedia(
    ['(prefers-color-scheme: dark)'],
    [true],
    false
  );

  // Usa nosso useLocalStorage hook pra manter o estado mesmo com o refresh da pagina.
  const [enabled, setEnabled] = useLocalStorage(
    'dark-mode-enabled',
    prefersDarkMode
  );

  // Aciona o efeito que adiciona/remove o dark mode.
  useEffect(
    () => {
      const className = 'dark';
      const element = window.document.body;
      if (enabled) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    },
    [enabled] // Apenas re-executa a funcao quando o valor muda.
  );

  // Retorna habilitado o estado e o setter.
  return [enabled, setEnabled];
}
