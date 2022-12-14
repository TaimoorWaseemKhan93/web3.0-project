import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    useEffect(() => {
        const { ethereum } = window;
      
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const gameContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicGame.abi,
            signer
          );
      
          /*
           * This is the big difference. Set our gameContract in state.
           */
          setGameContract(gameContract);
        } else {
          console.log('Ethereum object not found');
        }
    }, [])

    const mintCharacterNFTAction = async (characterId) => {
        try {
          if (gameContract) {
            console.log('Minting character in progress...');
            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log('mintTxn:', mintTxn);
          }
        } catch (error) {
          console.warn('MintCharacterAction Error:', error);
        }
    };

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
            <div className="name-container">
                <p>{character.name}</p>
            </div>
            <img src={character.imageURI} alt={character.name} />
            <button
                type="button"
                className="character-mint-button"
                onClick={()=> mintCharacterNFTAction(index)}
            >{`Mint ${character.name}`}</button>
            </div>
        ));

        useEffect(() => {
            const getCharacters = async () => {
              try {
                console.log('Getting contract characters to mint');
          
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log('charactersTxn:', charactersTxn);
          
                const characters = charactersTxn.map((characterData) =>
                  transformCharacterData(characterData)
                );
          
                setCharacters(characters);
              } catch (error) {
                console.error('Something went wrong fetching characters:', error);
              }
            };
          
            /*
             * Add a callback method that will fire when this event is received
             */
            const onCharacterMint = async (sender, tokenId, characterIndex) => {
              console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
              );
          
              /*
               * Once our character NFT is minted we can fetch the metadata from our contract
               * and set it in state to move onto the Arena
               */
              if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log('CharacterNFT: ', characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
              }
            };
          
            if (gameContract) {
              getCharacters();
          
              /*
               * Setup NFT Minted Listener
               */
              gameContract.on('CharacterNFTMinted', onCharacterMint);
            }
          
            return () => {
              /*
               * When your component unmounts, let;s make sure to clean up this listener
               */
              if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint);
              }
            };
        }, [gameContract]);

        useEffect(() => {
            /*
             * Setup async function that will get the boss from our contract and sets in state
             */
            const fetchBoss = async () => {
              const bossTxn = await gameContract.getBigBoss();
              console.log('Boss:', bossTxn);
              setBoss(transformCharacterData(bossTxn));
            };
          
            if (gameContract) {
              /*
               * gameContract is ready to go! Let's fetch our boss
               */
              fetchBoss();
            }
          }, [gameContract]);
          
    return (
        <div className="select-character-container">
            <h2>Mint Your Hero. Choose wisely.</h2>
            {/* Only show this when there are characters in state */}
            {characters.length > 0 && (
            <div className="character-grid">{renderCharacters()}</div>
            )}
        </div>
    );
  };
  
export default SelectCharacter;