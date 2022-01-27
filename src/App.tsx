import React, { useEffect, useState } from "react";
import "./App.scss";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Tooltip,
} from "reactstrap";
import { WalletsService } from "./wallets.service";
import { RatesService } from "./rates.service";
import { Rate, Wallet, WalletDetails } from "./interfaces";
import moment from "moment";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";


const walletsService = new WalletsService();
const ratesService = new RatesService();

function App() {
  const [wallets, setWallets] = useState<Wallet[]>();
  const [rates, setRates] = useState<Rate[]>();
  const [orderBy, setOrderBy] = useState<"creationTS" | "isFavorite">(
    "creationTS"
  );
  const [selectedWallet, setSelectedWallet] = useState<WalletDetails>();
  const [selectedFiat, setSelectedFiat] = useState<Rate["fiat"]>("USD");
  const [address, setAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [isTooltipOpen, setIsTooltipOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedRateValue = rates?.find(
    (rate) => rate.fiat === selectedFiat
  )?.value;

  useEffect(() => {
    (async () => {
      const [wallesRes, ratesRes] = await Promise.all([
        walletsService.getWallets({ orderBy }),
        ratesService.getRates(),
      ]);

      if (wallesRes.success) {
        setWallets(wallesRes.data);
      } else {
      }

      if (ratesRes.success) {
        setRates(ratesRes.data);
      } else {
      }
    })();
  }, [orderBy]);

  const newWallet = async () => {
    if(!ethers.utils.isAddress(address)) return;

    const response = await walletsService.newWallet({ address });

    if (response.success) {
      setWallets((prev) => {
        if (!prev) return prev;

        const current = [...prev];
        current.push({
          address: address.toLowerCase(),
          isFavorite: false,
          creationTS: Date.now(),
        });

        current.sort((a, b) => +b[orderBy] - +a[orderBy]);

        return current;
      });
    } else {
      console.error(response.error.message);
    }
  };

  const openModal = async (_selectedWallet: Wallet) => {
    setSelectedWallet(undefined);
    setIsModalOpen(!isModalOpen);

    const response = await walletsService.getWallet({
      address: _selectedWallet.address,
    });
    
    setSelectedWallet(response.data);
  };

  const updateAddress = (value: string) => {
    if(value !== '') setIsValidAddress(ethers.utils.isAddress(value));
    else setIsValidAddress(undefined);
    
    setAddress(value);
  };

  const orderWallets = async (value: "creationTS" | "isFavorite") => {
    setOrderBy(value);
  };

  const updateRateValue = (value: number) => {
    setRates((prev) => {
      if (!prev) return prev;

      const current = [...prev];

      (current?.find((rate) => rate.fiat === selectedFiat) as Rate).value =
        value;

      return current;
    });
  };

  const updateRate = async () => {
    const response = await ratesService.updateRate({
      fiat: selectedFiat,
      value: selectedRateValue as number,
    });

    if (response.success) {
    } else {
    }
  };

  const setFavorite = async (prop: {
    address: string;
    isFavorite: boolean;
  }) => {
    const response = await walletsService.setFavorite(prop);

    if (response.success) {
      setWallets((prev) => {
        if (!prev) return prev;

        const current = [...prev];

        (
          current.find((wallet) => wallet.address === prop.address) as Wallet
        ).isFavorite = prop.isFavorite;


        return current;
      });
    } else {
      console.error(response.error.message);
    }
  };

  const toFiat = (value: string) => new BigNumber(value).times(selectedRateValue as number).toFixed(2);

  const minifyAddress = (value: string) => `${value.substring(0, 26)}...`;

  return (
    <>
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col xs={12} xl={8}>
            <InputGroup>
              <Input
                valid={isValidAddress}
                invalid={isValidAddress !== undefined? !isValidAddress: undefined }
                placeholder="0x12122..."
                value={address}
                onChange={(e) => updateAddress(e.target.value)}
              />
              <FormFeedback
                tooltip
                valid={isValidAddress}
                invalid={isValidAddress !== undefined? !isValidAddress: undefined }
              >
                {isValidAddress && 'Valid Address'}
                {!isValidAddress && 'Invalid Address'}
              </FormFeedback>
              <Button color="info" onClick={newWallet}>
                SAVE WALLET
              </Button>
            </InputGroup>
          </Col>
        </Row>
        <br />
        <Row className="justify-content-center">
          <Col xs={12} xl={4}>
            <InputGroup>
              <InputGroupText>1 ETH =</InputGroupText>
              <Input
                type="number"
                value={rates?.find((rate) => rate.fiat === selectedFiat)?.value}
                onChange={(e) => updateRateValue(+e.target.value)}
              />
              {/* <Label for="exampleSelect">Select</Label> */}
              <Input
                id="exampleSelect"
                name="select"
                type="select"
                value={selectedFiat}
                onChange={(e) => setSelectedFiat(e.target.value as any)}
              >
                <option>USD</option>
                <option>EUR</option>
              </Input>
              <Button color="info" onClick={updateRate}>
                UPDATE RATE
              </Button>
            </InputGroup>
          </Col>
        </Row>
        <br />
        <Row className="justify-content-center">
          <Col xs={12} xl={4}>
            <span className="fw-bold">ORDER BY</span>{" "}
            <Button
              color="info"
              outline={orderBy !== 'creationTS'}
              onClick={() => orderWallets("creationTS")}
            >
              <i className="bi bi-clock-history"></i> DATE
            </Button>{" "}
            <Button
              color="info"
              outline={orderBy !== 'isFavorite'}
              onClick={() => orderWallets("isFavorite")}
            >
              <i className={`bi bi-suit-heart-fill`}></i> FAVORITE
            </Button>
            {/* <Input id="exampleSelect" name="select" type="select">
              <option>ASCENDING</option>
              <option>DESCENCING</option>
            </Input> */}
          </Col>
        </Row>
        <br />
        <Row>
          {wallets?.map((wallet, i) => (
            <Col key={wallet.address} xs={12} xl={4}>
              <Card>
                <CardBody>
                  <CardTitle tag="h5">
                    {/* 0x012334444423423... */}
                    {minifyAddress(wallet.address)}
                    <i
                      className={`bi ${
                        (
                          isTooltipOpen[wallet.address]
                            ? !wallet.isFavorite
                            : wallet.isFavorite
                        )
                          ? "bi-suit-heart-fill"
                          : "bi-heart"
                      }`}
                      id={'id'+i.toString()}
                      style={{
                        fontSize: "2rem",
                        color: "red",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setFavorite({
                          address: wallet.address,
                          isFavorite: !wallet.isFavorite,
                        })
                      }
                    ></i>
                    <Tooltip
                      flip
                      target={'id'+i.toString()}
                      isOpen={isTooltipOpen[wallet.address]}
                      toggle={() =>
                        setIsTooltipOpen((prev) => ({
                          ...prev,
                          [wallet.address]: !prev[wallet.address],
                        }))
                      }
                    >
                      {(
                        isTooltipOpen[wallet.address]
                          ? !wallet.isFavorite
                          : wallet.isFavorite
                      )
                        ? "Add to Favorite"
                        : "Remove from Favorite"}
                    </Tooltip>
                  </CardTitle>
                  {/* <CardText>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </CardText> */}
                  <Button onClick={() => openModal(wallet)}>VIEW</Button>
                </CardBody>
              </Card>
              <br />
            </Col>
          ))}
        </Row>
      </Container>
      <div>
        <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
          <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
            Wallet Details
          </ModalHeader>
          <ModalBody>
            {selectedWallet && 
              <div>
                <p>Address: {selectedWallet.address}</p>
                <div>
                  <InputGroup>
                    Balance: {toFiat(selectedWallet.balance)}
                    {/* <Label for="exampleSelect">Select</Label> */}
                    <div style={{marginLeft: '5px', marginTop: '-5px'}}>
                      <Input
                        id="exampleSelect"
                        name="select"
                        type="select"
                        value={selectedFiat}
                        onChange={(e) => setSelectedFiat(e.target.value as any)}
                      >
                        <option>USD</option>
                        <option>EUR</option>
                      </Input>
                    </div>
                  </InputGroup>
                </div>
                <p>Creation Date: {moment(selectedWallet.creationTS).format('LLL')}</p>
                {selectedWallet.firstTxTS && 
                <>
                  <p>First Transaction: {moment(selectedWallet.firstTxTS).format('LLL')}</p>
                  {
                  (Date.now() - selectedWallet.firstTxTS >= 365 * 24 * 3600 * 1000)
                    ? <Alert color="danger">This Wallet is old</Alert>
                    : <Alert color="info">This Wallet is not old</Alert>
                  }
                </>
                }
              </div>
            
            }
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(!isModalOpen)}>CLOSE</Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
}

export default App;
