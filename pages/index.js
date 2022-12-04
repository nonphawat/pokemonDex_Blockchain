import styles from "../styles/Home.module.css";
import { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// import contractAddress  from "../backend/contractAddress";
import conAbi from "../backend/pokemonAbi.json";

export default function Home() {
  const [pokemonList,setPokemonlist] = useState([]);

  const [provider, setProvider] = useState();
  const [account, setAccount] = useState("");
  const [library, setLibrary] = useState("");
  const nameOf = useRef(null);
  const typeOf = useRef(null);
  const [pokemons, setPoke] = useState([]);
  const contractAddress = "0x0F1247aaeE951A05d1442b3a3E59Ce22B5D733F1";

  const connectWallet = async () => {
    try {
      let web3Modal = new Web3Modal({
        cacheProvider: false,
      });
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();

      setProvider(provider);
      setLibrary(library);

      if (accounts) setAccount(accounts[0]);
    } catch (error) {
      console.log("Error");
    }
    // let chainId= await library.request({methods: 'eth_chainId'})
  };

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      provider.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [provider]);

  useEffect(()=> {
    connectWallet();
    getAll()

  },[]);

  async function getAll()  {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const PokeContract = new ethers.Contract(contractAddress, conAbi, signer);
      setPoke(await PokeContract.getMypokemon())
      
    }
  }

  useEffect(()=> {
    
    getAll()

  },[pokemons]);

  const savePoke = async (e) => {
    e.preventDefault();
    let chainId = await provider.chainId;
    const goeliChainId = "0x5";
    if (chainId !== goeliChainId) {
      alert("Please connect to the Goeli testnet");
    } else {
      if (nameOf.current.value != "" && typeOf.current.value != "") {
        let pokemon = {
          id: pokemons.length,
          pokeName: nameOf.current.value,
          pokeType: typeOf.current.value,
        };

        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();

            const PokeContract = new ethers.Contract(
              contractAddress,
              conAbi,
              signer
            );
            
            PokeContract.addPokemon(pokemon.pokeName, pokemon.pokeType)
              .then((res) => {
                
                setPoke([...pokemons, pokemon]);
                console.log("Added Pokemon");
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log("ethereum object does not exist!!!");
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("name and type can not be null");
      }
    }
  };

  return (
    <div className=" container text-center">
      <div>
        <div className="p-2 row">
          <div className="col"></div>
          <div className="col">
            {/* <button onClick={test}>Test</button> */}
          </div>
          <div className="col">
            {account === "" ? (
              <button
                onClick={connectWallet}
                type="button"
                className="btn btn-outline-light"
              >
                Connnect Wallet
              </button>
            ) : (
              <button
                onClick={connectWallet}
                type="button"
                className="btn btn-outline-light"
                disabled
              >
                {account}
              </button>
            )}
            {/* <button
              onClick={connectWallet}
              type="button"
              className="btn btn-outline-light"
            >
              Connect Wallet
            </button> */}
          </div>
        </div>
      </div>

      <div className="container text-center">
        <div className="row">
          <h1 className="p-3">My Pokemon Dex</h1>
        </div>
        <div className="row">
          <div className="input-group mb-3">
            <input
              ref={nameOf}
              type="text"
              className="form-control"
              placeholder="Pokemon' name"
            ></input>
            <input
              ref={typeOf}
              type="text"
              className="form-control"
              placeholder="Type"
            ></input>
            <button
              className="btn btn-outline-success"
              type="button"
              id="button-addon2"
              onClick={savePoke}
            >
              Save
            </button>
          </div>
          (if push a button , pay gas fee and wait transaction complete)
        </div>
        <div className="p-3 row ">
          <div className="col">
            <h4 className={styles.underline}>Name</h4>
            <ul className={styles.withNo}>
              {pokemons.map((animal) => (
                <li key={animal.id} className={styles.liFloat}>
                  {animal.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="col">
            <h4 className={styles.underline}>Type</h4>
            <ul className={styles.withNo}>
              {pokemons.map((animal) => (
                <li key={animal.id} className={styles.liFloat}>
                  {animal.typeOfpokemon}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
