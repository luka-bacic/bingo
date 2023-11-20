import {useState, useEffect} from 'react';
import useLocalStorage from 'use-local-storage';
import {PencilIcon, ResetIcon, ShareIcon, GithubIcon} from './Icons';
import Card from './Card';

export default function App() {
    const requiredLabelAmount = 24;
    const middleCardIndex = 12;

    const [gameStarted, setGameStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    type Card = {id: number; checked: boolean; value: string};
    const [cards, setCards] = useLocalStorage<Card[]>('cards', mapCards());

    // try to load cards from url
    useEffect(() => {
        const url = new URL(window.location.toString());
        const cards = url.searchParams.get('cards');
        if (cards) {
            try {
                const labelArray = JSON.parse(cards);
                if (
                    Array.isArray(labelArray) &&
                    labelArray.every((label) => typeof label === 'string')
                ) {
                    setCards(mapCards(labelArray));
                } else {
                    throw new Error('Failed to load cards from your link');
                }
            } catch (e) {
                if (e instanceof Error) {
                    console.log(e);
                    if (e?.name === 'SyntaxError') {
                        setError('The link you pasted has bad data');
                        return;
                    }
                    setError(e.message);
                }
            } finally {
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.origin + window.location.pathname
                );
            }
        }
    }, []);

    /** Creates 25 bingo cards with optional labels. Handles the middle card being special */
    function mapCards(cardLabels: string[] = []) {
        return Array.from({length: 25}, (_, index) => {
            const isMiddleCard = middleCardIndex === index;
            return {
                id: Math.random(),
                checked: isMiddleCard, // middle card is always checked
                value: isMiddleCard ? 'O' : cardLabels[index] ?? ''
            };
        });
    }

    /** To win, you need to have any 1 horizontal, vertical or diagonal line fully checked */
    function isBingo() {
        if (!gameStarted) return false;
        return (
            // horizontal matches
            cards.slice(0, 5).every((c) => c.checked) ||
            cards.slice(5, 10).every((c) => c.checked) ||
            cards.slice(10, 15).every((c) => c.checked) ||
            cards.slice(15, 20).every((c) => c.checked) ||
            cards.slice(20, 25).every((c) => c.checked) ||
            // vertical matches
            cards.filter((_, index) => index % 5 === 0).every((c) => c.checked) ||
            cards.filter((_, index) => index % 5 === 1).every((c) => c.checked) ||
            cards.filter((_, index) => index % 5 === 2).every((c) => c.checked) ||
            cards.filter((_, index) => index % 5 === 3).every((c) => c.checked) ||
            cards.filter((_, index) => index % 5 === 4).every((c) => c.checked) ||
            // diagonal matches
            // top left to bottom right
            cards.filter((_, index) => index % 6 === 0).every((c) => c.checked) ||
            // bottom left to top right
            cards
                .filter((_, index) => index % 4 === 0)
                .slice(1, -1)
                .every((c) => c.checked)
        );
    }

    /** Provides a link to copy your bingo card and share it with others  */
    function onShare() {
        const dataForSharing = cards.map((c) => c.value.trim());
        const stringifiedCards = JSON.stringify(dataForSharing);
        window.alert(
            `Copy this link to share your bingo card with others

${window.location.href + '?cards=' + stringifiedCards}`
        );
    }

    /** Shuffles everything except the middle card */
    function onShuffleCards() {
        setCards((previous) => {
            const middleCard: Card = {id: Math.random(), checked: true, value: 'O'};
            const next = (previous || [])
                // remove middle card
                .filter((_, index) => index !== middleCardIndex)
                // shuffle array
                .sort(() => (Math.random() > 0.5 ? 1 : -1))
                // insert back the middle card
                .flatMap((card, index) => {
                    if (index === middleCardIndex) return [middleCard, card];
                    return card;
                });
            return next;
        });
    }

    function onResetCards() {
        if (confirm('This will clear all your bingo cards. Proceed?')) {
            setCards(mapCards());
            setGameStarted(false);
        }
    }

    function onBackToEditMode() {
        setCards(mapCards(cards.map((c) => c.value)));
        setGameStarted(false);
    }

    const numberOfCardsWithLabels = cards.reduce((count, card, index) => {
        if (index === middleCardIndex) return count;
        if (card.value.trim().length > 0) count += 1;
        return count;
    }, 0);
    const allCardsHaveLabels = numberOfCardsWithLabels === requiredLabelAmount;
    const headerHeight = '3rem';
    const noticeStyles: React.CSSProperties = {
        textAlign: 'center',
        width: 'max-content',
        maxWidth: '100vw',
        paddingBottom: '1rem'
    };
    const actionsWrapperStyles: React.CSSProperties = {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        padding: '1rem 0'
    };
    return (
        <>
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '.5rem',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                    height: headerHeight,
                    padding: '.5rem 1rem'
                }}
            >
                {gameStarted && (
                    <button title="Edit cards" onClick={onBackToEditMode} className="nav-button">
                        <PencilIcon />
                    </button>
                )}
                <button title="Clear cards" onClick={onResetCards} className="nav-button">
                    <ResetIcon />
                </button>
                <button
                    title="Share link to your bingo card"
                    onClick={onShare}
                    className="nav-button"
                >
                    <ShareIcon />
                </button>
                <a
                    title="View source code"
                    href="https://github.com/luka-bacic/bingo"
                    style={{width: '1.75rem', height: '1.75rem'}}
                >
                    <GithubIcon />
                </a>
            </header>
            <div
                style={{
                    margin: `-${headerHeight} auto 0`,
                    paddingTop: headerHeight,
                    width: 'min-content',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }}
            >
                {error && (
                    <div style={noticeStyles}>
                        <h1 style={{color: 'red'}}>{error}</h1>
                    </div>
                )}

                {!gameStarted && (
                    <div style={noticeStyles}>
                        {!allCardsHaveLabels ? (
                            <span>
                                <h1>Start by adding some text to all cards</h1>
                                <p style={{padding: '1rem 0'}}>
                                    {numberOfCardsWithLabels} / {requiredLabelAmount} cards are
                                    ready
                                </p>
                            </span>
                        ) : (
                            <span>
                                <h1>The game is ready, press start when ready</h1>
                                <div style={actionsWrapperStyles}>
                                    <button onClick={() => setGameStarted(true)}>Start</button>
                                    <button onClick={onShuffleCards}>Shuffle cards</button>
                                </div>
                            </span>
                        )}
                    </div>
                )}

                {isBingo() && (
                    <div style={noticeStyles}>
                        <h1 style={{paddingBottom: '1rem'}}>BINGO!</h1>
                        <div style={actionsWrapperStyles}>
                            <button onClick={onResetCards}>New game</button>
                            <button onClick={onBackToEditMode}>Play again</button>
                        </div>
                    </div>
                )}

                <div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gridTemplateRows: 'repeat(5, 1fr)',
                            gap: '.125rem'
                        }}
                    >
                        {cards.map((card, index) => {
                            return (
                                <Card
                                    key={index}
                                    asCheckbox={gameStarted}
                                    isMiddleCard={index === middleCardIndex}
                                    textValue={card.value}
                                    onTextChange={(next) =>
                                        setCards((prev) =>
                                            prev?.map((previousCard) => {
                                                if (card.id === previousCard.id)
                                                    return {...previousCard, value: next};
                                                return previousCard;
                                            })
                                        )
                                    }
                                    checked={card.checked}
                                    onCheckboxChange={() =>
                                        setCards((prev) =>
                                            prev?.map((previousCard) => {
                                                if (card.id === previousCard.id)
                                                    return {
                                                        ...previousCard,
                                                        checked: !previousCard.checked
                                                    };
                                                return previousCard;
                                            })
                                        )
                                    }
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
