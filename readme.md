# wudup gamers
# gamer 2
# poggers
# david andrea cole iain
# hess pls help
```haskell
rank :: Prog -> Rank -> Maybe Rank
rank [] n = Just n
rank (c:cs) n | (t > n) = Nothing
              | otherwise = Just (n - t + p)
              where (t, p) = rankC c

rankP :: Prog -> Maybe Rank
rankP [] = Just 0
rankP (c:cs) = (rankP cs) >>= (rank (c:cs))
```