import React from "react";
import { Card, Header, Image } from "semantic-ui-react";

export default function Intro(props) {
  return (
      <div>
        <Header as='h1'>Radices Identity</Header>
        <Header as='h3'>Welcome to the Identity Playground based on Substrate Blockchain</Header>
        <p>Lorena is an open source tech stack, built in rust, designed to provide a self-sovereign decentralized global private Identity to everyone. This is the Backbone to the new Internet. Lorena  has the potential to create ecosystems thanks to our interoperable hub system built with our tech stack.</p>
                <Card.Group>
                    <Card>
                        <Card.Content>
                            <Image floated='right' size='mini' src='/seeds.png'/>
                            <Card.Header>Verifiable Credentials - VCs</Card.Header>
                            <Card.Meta>The Seeds</Card.Meta>
                            <Card.Description>A <strong>credential</strong> is an attestation of qualification, competence, or authority issued to an individual by a third party with a relevant or de facto authority or assumed competence to do so.</Card.Description>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Content>
                            <Image floated='right' size='mini' src='/branches.png'/>
                            <Card.Header>Identifiers in the Blockchain - DIDs</Card.Header>
                            <Card.Meta>The Branches</Card.Meta>
                            <Card.Description>The Blockchain Network where  identities (DIDs) are created and stored and Credentials can be verified.</Card.Description>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Content>
                            <Image floated='right' size='mini' src='/containers.png'/>
                            <Card.Header>Verifiable Credentials</Card.Header>
                            <Card.Meta>The Seeds</Card.Meta>
                            <Card.Description>A portable database for Credentials and Identity related Information. Each Container has one unique decentralized identifier : DID</Card.Description>
                        </Card.Content>
                    </Card>

                </Card.Group></div>
  );
}
