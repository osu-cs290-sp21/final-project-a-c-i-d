import Prelude

type PlayerState = String
type PlayerId = String

type Player = (PlayerId, PlayerState)

data SocketStatus = Connecting | Open | Closing | Closed deriving (Show, Eq)
data SocketSession = Session {
                        status :: SocketStatus
                        ,timeStamp :: String
                        ,iden :: String
                        } deriving (Show, Eq)

type Connection = (SocketSession, Player)
type ConnectionPool = [Connection]

data Sever = Serve {
                sploink :: SocketSession -> Connection
                ,broadcast :: ConnectionPool -> IO ()
                ,recieve :: Player -> ConnectionPool -> ConnectionPool
                }


transmit :: String -> IO ()
transmit = putStrLn -- for now

jsonPlayerEncode = id -- for now

sploinkIntoThePool :: SocketSession -> Connection
sploinkIntoThePool sesh = (sesh, (iden sesh ++ timeStamp sesh, ""))

updater :: Player -> ConnectionPool -> ConnectionPool
updater (iden, state) pool = map (\x -> if fst (snd x) == iden then (fst x, (iden, state)) else x) pool

broadcast' :: ConnectionPool -> IO ()
broadcast' pool = do 
                    let playerStatePairs = map (show . jsonPlayerEncode . snd) pool
                    let seshes = map fst pool
                    mapM_ (transmit . fst) [ (msg, sesh) | msg <- playerStatePairs, sesh <- seshes]

                    


playerServer = Serve {
                    sploink=sploinkIntoThePool
                    ,broadcast=broadcast'
                    ,recieve=updater
                }

run pool   = do 
                con <- getLine
                iden' <- getLine
                let pool' = sploink playerServer (Session { status=Open, timeStamp=iden', iden=iden' }) : pool
                broadcast playerServer pool'
                run pool'
          