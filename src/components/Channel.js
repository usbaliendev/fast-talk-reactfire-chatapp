import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import { useFirestoreQuery } from '../hooks';
// Componentes
import Message from './Message';
import { reduce } from 'lodash';

const Channel = ({ user = null }) => {
  const db = firebase.firestore();
  const messagesRef = db.collection('messages');
  const messages = useFirestoreQuery(
    messagesRef.orderBy('createdAt', 'asc').limit(100)
  );

  const [newMessage, setNewMessage] = useState('');

  const inputRef = useRef();
  const bottomListRef = useRef();

  const { uid, displayName, photoURL } = user;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const handleOnChange = e => {
    setNewMessage(e.target.value);
  };  
  // console.log(user.uid);
  // messages.filter(function(message){
  //   console.log(message.uid);
  // });

 
  const handleOnSubmit = e => {
    e.preventDefault();

    const trimmedMessage = newMessage.trim();
    if (trimmedMessage) {
      // Adiciona nova mensagem no Firestore
      messagesRef.add({
        text: trimmedMessage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        displayName,
        photoURL,
      });
      // Limpa o campo do input
      setNewMessage('');
      // Faz o scroll pro fim das mensagens
      bottomListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  //css das box de tudo que nao for user logado
  const message_box_recebe = {

    borderRadius: "5px",
    marginRight: "50%",
    padding: "10px",
    

  };
    //css da box do user logado

  const message_box_logado = {

    borderRadius: "5px",
    marginLeft: "50%",
    padding: "10px"

  }; 

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto h-full">
        <div className="py-4 max-w-screen-lg mx-auto">
          <div className="border-b dark:border-gray-600 border-gray-200 py-8 mb-4">
            <div className="font-bold text-3xl text-center">
              <p className="mb-1">Bem vindo ao</p>
              <p className="mb-1 text-blue-300">Fast Talk</p>
              <p className="mb-1 text-blue-600">Chat</p>
            </div>
            <p className="text-gray-400 text-center">
              Esse é o começo desse chat
            </p>
          </div>
          <ul>
            {/* intera sobre cada mensagem e compara entre o usuario logado e da msg enviada */}
            {messages.map(function(message){
              if(message.uid == user.uid){
                return <li key={message.id} style={message_box_logado}>
                          <Message {...message} />
                        </li>;
              }
              else {
                return <li key={message.id} style={message_box_recebe}>
                          <Message {...message} />
                       </li>;
              }
            })}
          </ul>
          <div ref={bottomListRef} />
        </div>
      </div>
      <div className="mb-6 mx-4">
        

        

        <form
          onSubmit={handleOnSubmit}
          className="flex flex-row bg-gray-200 dark:bg-coolDark-400 rounded-md px-4 py-3 z-10 max-w-screen-lg mx-auto dark:text-white shadow-md"
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleOnChange}
            placeholder="Escreva sua mensagem aqui..."
            className="flex-1 bg-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage}
            className="uppercase font-semibold text-sm tracking-wider text-blue-600 hover:text-white hover:bg-blue-600 rounded py-2 px-4 mr-4 focus:outline-none transition-all"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

Channel.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  }),
};

export default Channel;
