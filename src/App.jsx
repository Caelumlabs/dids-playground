import keyring from '@polkadot/ui-keyring';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Message, Step, Select, Button, Header, Form, Input, Card, Container, Dimmer, Loader, Grid, Dropdown, Image, Menu } from "semantic-ui-react";
import DeveloperConsole from "./DeveloperConsole";
import NodeInfo from "./NodeInfo";
import "semantic-ui-css/semantic.min.css";
import React, { useState, useEffect, createRef } from "react";
const { mnemonicGenerate, mnemonicToSeed, naclKeypairFromSeed } = require('@polkadot/util-crypto');
const { encodeAddress } = require('@polkadot/keyring');


export default function App() {
  const WS_PROVIDER = "ws://127.0.0.1:9944";
  const [api, setApi] = useState();
  const [apiReady, setApiReady] = useState();
  const [id_name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [addUser, setAddUser] = useState(false);
  const [id_email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(0);
  const [step, setStep] = useState(0);

  const options = [
    { text: 'Polkadot', value: 'polkadot' },
    { text: 'uPort (Ethereum)', value: 'uport' },
    { text: 'Evernym (Indy)', value: 'evernym' },
    { text: 'Cosmos', value: 'cosmos' },
    { text: 'RIF (Bitcoin)', value: 'rif' },
  ]

  useEffect(() => { 

    const provider = new WsProvider(WS_PROVIDER);
    const TYPES = {};

    // Load User from LocalStorage
    const loadUser = () => {
      let _user = localStorage.getItem('user');
      if (_user !== null) {
        setUser(JSON.parse(_user));
      }
      return JSON.parse(_user);
    }

    // 1. Load all accounts into Keyring
    console.log("1 ** Load Accounts to keyring")
    keyring.loadAll({
      isDevelopment: true
    });
    
    // 2. Load Current User. If any
    console.log("2 ** Load User")
    loadUser();

    // 3. Load Substrate API
    console.log("3 ** Load Substrate API")
    ApiPromise.create({ provider, types: TYPES})
    .then(api => {
      setApi(api);
      api.isReady.then(() => {
        setApiReady(true);

        // Filter some event from feed
        console.log("4 ** Listen to events : ")
        api.query.system.events(events => {
          events.forEach(record => {
            const { event, phase } = record;
            const types = event.typeDef;

            let eventName = `${event.section}:${event.method}`;
            let params = event.data.map((data, index) => { return `${types[index].type}: ${data.toString()}`;});
            // A new DID is created for user's address
            if (eventName == 'radices:DidCreated') {
              let _user = JSON.parse(localStorage.getItem('user'));
              _user.did = params[1]
              setUser(_user);
              localStorage.setItem('user', JSON.stringify(_user));
              setAddUser(false);
              setStep(2);
            }
          })
        })
      })
    })
    .catch(e => console.error(e));
  }, []);

  // Initial loader function.
  const loader = function(text) {
    return (
      <Dimmer active>
        <Loader size="small">{text}</Loader>
      </Dimmer>
    );
  };

  if (!apiReady) {
    return loader("Connecting to the blockchain");
  }

  const contextRef = createRef();

    // Show DID Info
    const setBlockchain = (event) => {
      let content = ''
      if (event == 'polkadot') {
        setStep(1)
      }
      else {
        setError(1)
      }
    }

    // Show Lorena Info
    const radices_info = () => {
      let content = '';
      if (error) {
        content = (
          <Message color='yellow'>
            <b>Not available yet</b><br/>
            We are working to add more Identities to Lorena
          </Message>
        );
      }
      return(
        <div>
          <Card fluid>
          <Header as='h2' icon textAlign='center' style={{ marginTop:'20px', marginBottom: '15px' }}>
            <Image centered size='large' src='/containers.png'/>
            <Header.Content>Lorena Hub</Header.Content>
            <Header.Subheader>
            Interoperable open-source system to connect identities through different blockchains
            </Header.Subheader> 
          </Header>
          <Card.Content>
            <Container>
              <Header as='h3'>Welcome to Lorena</Header>
              <Form>
                <Form.Field inline width={6}>
                  <Form.Field
                    control={Select}
                    label='Select SSI Tech'
                    options={options}
                    placeholder='Blockchain'
                    onChange={(_, _data) => setBlockchain(_data.value)}
                  />
                </Form.Field>
                {content}
              </Form>
            </Container>
          </Card.Content>
            <Card.Content>
              <Card.Description>
                Lorena is part of Lorena Ecosystem, an interoperable framework for self-sovereign identities that can be implemented in any decentralized network and ready to use by third parties as a middleware
              </Card.Description>
            </Card.Content>
          </Card>
        </div>
      );
    }
  // Clear Identity in the Playground.
  const clearID = () => {
    localStorage.removeItem('user');
    setUser(null);
  }

  // Create and save new DID.
  const saveIdentity = async () => {
    setAddUser(true);
    const mnemonic = mnemonicGenerate();
    const seed = mnemonicToSeed(mnemonic);
    const { secretKey, publicKey } = naclKeypairFromSeed(seed);
    createDID()
    const _user = {
      handler: id_name,
      seed,
      mnemonic,
      secretKey,
      publicKey,
      address: encodeAddress(publicKey),
      did: ''
    }
    setUser(_user);
    localStorage.setItem('user', JSON.stringify(_user));
  }

  // Call Blockchain and add a new DID.
  const createDID = async () => {
    const accounts = keyring.getPairs()
    let transaction = api.tx.radices.createDid(10);
    transaction
      .signAndSend(accounts[0], ({ status }) => {
        if (status.isFinalized) {
          console.log(`Completed at block hash #${status.asFinalized.toString()}`)
          
        } else {
          console.log(`Current transaction status: ${status.type}`)
        }
      })
      .catch(e => {
        console.log(":( transaction failed");
        console.error("ERROR:", e);
      });
  }

  const did_info = () => {
    console.log(user)
    let content = '';
    if (addUser) {
      content = (<Loader active inline='centered' />);
    }
    else if (user !== null && user.handler !== false) {
      content = (
        <Card.Content>
          <div>handler: @{user.handler}</div>
          <div>Address: {user.address}</div>
          <div>{user.did}</div>
          <div><a href="#" onClick={ () => {clearID()}}>Clear Identity</a></div>
        </Card.Content>
      )
    }
    else {
      content = (
        <Card.Content>
          <Container>
            <Header as='h3'>First you need to create a new DID in the Blockchain</Header>
            <Form>
              <Form.Field inline width={6}>
                <label>User handler</label>
                <Input onChange={(_, data) => {setName(data.value)}} label="@" placeholder="identity" state="id_name" type="text"/>
              </Form.Field>
              <Form.Button>
              <Button type="submit" disabled={id_name.length<3} onClick={() => saveIdentity()} >Create Identity</Button>
              </Form.Button>
            </Form>
          </Container>
        </Card.Content>
      )
    }
    return(
      <div>
        <Card fluid>
        <Header as='h2' icon textAlign='center'>
          <Image centered size='large' src='/containers.png'/>
          <Header.Content>Global Unique Identifiers - DIDs</Header.Content>
          <Header.Subheader>
            Manage your account settings and set email preferences
          </Header.Subheader> 
        </Header>
          {content}  
          <Card.Content>
            <Card.Description>
              <b>Decentralized Identifiers (DIDs)</b> are a new type of identifier for verifiable, decentralized digital identity. These new identifiers are designed to enable the controller of a DID to prove control over it and to be implemented independently of any centralized registry, identity provider, or certificate authority
              <br/><a href="https://w3c-ccg.github.io/did-spec/">W3C: Decentralized Identifiers (DIDs) v0.13</a>
              <br/><Button onClick={() => setStep(2)} >Go to Credentials</Button>
            </Card.Description>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const saveCredential = async () => {

  }

  const vc_info = () => {    
    let content;
    if (user === null) {
      content = (
        <Card.Content textAlign="center">
          Create a DID first to associate Credentials to it
        </Card.Content>
      );
    }
    else if (loading) {
      content = ( <Loader active inline='centered' />);
    }
    else {
      content = (
        <Card.Content>
          <Container>
            <Header as='h3'>Add a new Credential about you: your email</Header>
            <Form>
              <Form.Field inline width={6}>
                <label>Your email</label>
                <Input onChange={(_, data) => {setEmail(data.value)}} label="@" placeholder="email" state="id_email" type="text"/>
              </Form.Field>
              <Form.Field>
                <Button primary type="submit" disabled={id_email.length<3} onClick={() => saveCredential()} >Create new VC</Button>
              </Form.Field>
            </Form>
            
          </Container>
        </Card.Content>
      )
    }
    return (
      <div >
        <Card fluid>
          <Card.Content>
            <Header as='h2' icon textAlign='center' style={{ marginTop:'35px' }}>
              <Image centered size='large' src='/seeds.png'/>
              <Header.Content>Verifiable Credentials - DIDs</Header.Content>
              <Header.Subheader>
                Manage your onlien identity from a single identifier
              </Header.Subheader> 
            </Header>
          </Card.Content>
          {content}
          <Card.Content>
            <Card.Description>
              <b>Credentials</b> are a part of our daily lives; driver's licenses are used to assert that we are capable of operating a motor vehicle, university degrees can be used to assert our level of education, and government-issued passports enable us to travel between countries. This specification provides a mechanism to express these sorts of credentials on the Web in a way that is cryptographically secure, privacy respecting, and machine-verifiable.
              <br/><a href="https://www.w3.org/TR/vc-data-model/">W3C: Verifiable Credentials (VC) v1.0</a>
            </Card.Description>
          </Card.Content>    
        </Card>
      </div>
    );
  }

  const show_info = () => {
    switch (step) {
      case 0: return radices_info(); break;
      case 1: return did_info(); break;
      case 2: return vc_info(); break;
    }

  }

  return (
    <div ref={contextRef}>
      <Container>
        
{/********** MENU TOP **********/}
        <Menu fixed='top' inverted>
          <Container>
            <Menu.Item as='a' header>
              <Image size='mini' src='/logo.png' style={{ marginRight: '1.5em' }} />
              Radices Playground
            </Menu.Item>
            <Menu.Item as='a'>Home</Menu.Item>
            <Dropdown item simple text='Identities'>
              <Dropdown.Menu>
                <Dropdown.Item>Alex</Dropdown.Item>
                <Dropdown.Item>Sandra</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>Actions</Dropdown.Header>
                <Dropdown.Item >Add Identity</Dropdown.Item>
                <Dropdown.Item>Clear identities</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Container>
        </Menu>
        
{/********** MAIN CONTAINER - 2 rows**********/}
        <Container style={{ marginTop: '7em' }}>
          <Grid columns={2} stackable>
            <Grid.Column width={4}>
            <Step.Group vertical>
              <Step active={(step==0)}>
               < Image size='mini' src='/containers.png' style={{marginRight:'10px'}}/>
                <Step.Content>
                  <Step.Title>Lorena</Step.Title>
                  <Step.Description>Choose Blockchain</Step.Description>
                </Step.Content>
              </Step>

              <Step active={(step==1)}>
              < Image size='mini' src='/containers.png' style={{marginRight:'10px'}}/>
                <Step.Content>
                  <Step.Title>DIDs</Step.Title>
                  <Step.Description>Global Identifier</Step.Description>
                </Step.Content>
              </Step>

              <Step active={(step==2)}>
                <Image size='mini' src='/seeds.png' style={{marginRight:'10px'}} />
                
                <Step.Content>
                  <Step.Title>Credentials</Step.Title>
                  <Step.Description>Name, Email</Step.Description>
                </Step.Content>
              </Step>
            </Step.Group>
              <Card.Group>
                <NodeInfo api={api} />
              </Card.Group>
            </Grid.Column>
            <Grid.Column width={12}>

{/********** DIDS **********/}
              {show_info()}
          </Grid.Column>
      </Grid>
    </Container>
    <DeveloperConsole api={api} />
  </Container>
</div>
);
}
