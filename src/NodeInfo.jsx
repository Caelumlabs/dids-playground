import React, { useEffect, useState } from "react";

import { Statistic, Card, Icon, Grid } from "semantic-ui-react";

export default function NodeInfo(props) {
  const { api } = props;
  const [nodeInfo, setNodeInfo] = useState({});
  const [blockNumber, setBlockNumber] = useState(0);
  const [blockNumberTimer, setBlockNumberTimer] = useState(0);

  const bestNumber = api.derive.chain.bestNumber;


  useEffect(() => {
    const getInfo = () => {
      Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
      ])
        .then(([chain, nodeName, nodeVersion]) => {
          setNodeInfo({
            chain,
            nodeName,
            nodeVersion
          });
        })
        .catch(e => console.error(e));
    };
    getInfo();
  }, [api.rpc.system]);

  useEffect(() => {
    let unsubscribeAll;
    bestNumber(number => {
      setBlockNumber(number.toNumber());
      setBlockNumberTimer(0);
    })
    .then(unsub => {
      unsubscribeAll = unsub;
    })
    .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [bestNumber]);

  const timer = () => {
    setBlockNumberTimer(time => time + 1);
  };

  useEffect(() => {
    const id = setInterval(timer, 1000);
    return () => clearInterval(id);
  }, []);

  return (
      <Card fluid>
        <Card.Content>
          <Card.Header>Test Blockchain</Card.Header>
          <Card.Meta>
            <span>Block Number</span>
          </Card.Meta>
          <Card.Content textAlign="center">
            <Statistic
              value={blockNumber}
            />
 
          </Card.Content>
        </Card.Content>
        <Card.Content extra>
          <Icon name="time" /> Next Block in {10-blockNumberTimer} sec
        </Card.Content>
      </Card>
  );
}
