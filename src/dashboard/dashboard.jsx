import React, { useEffect, useState } from 'react';
import Footer from '../components/footer/footer';
import Navbar from '../components/navbar/navbar';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import './dashboard.css';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
import MoodIcon from '@mui/icons-material/Mood';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProgressBar from '../components/progressBar.js/progressBar';

export default function Dashboard() {
    const [feed, setFeed] = useState(null);
    const [items, setItems] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const intervalID = setInterval(() => {
            if (feed !== null) {
                GetNewsReports(feed)
                // console.log("get")
            }
        }, 180000)
        return () => clearInterval(intervalID)
    }, [feed])

    const GetEntities = async (result) => {
        let final = [];

        await Promise.allSettled(result.map(async (item) => {
            const emoRes = await axios.post(
                'https://api.text-miner.com/ner',
                `message=${item.text}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )
            setEntities((prev) => { return [...prev, emoRes.data] })
            final.push({ ...item, entities: emoRes.data })
        })
        )
        // setItems(final)
        setLoading(false)
    }
    const GetNewsReports = async (provider) => {
        setLoading(true)
        try {
            const res = await axios.get(`https://biz-api.text-miner.com/finfeed/${provider}`)
            let result = [];
            await Promise.allSettled(
                JSON.parse(res.data).map(async (item, i) => {
                    const itemArray = item.split("\t");
                    let currObject = {
                        text: itemArray[0],
                        date: itemArray[1]
                    }
                    const response = await axios.post(
                        'https://api.text-miner.com/sentiment',
                        `message=${currObject.text}`,
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }
                    );
                    let pos = response.data.positive_sentiment_percentage;
                    let neg = response.data.negative_sentiment_percentage;
                    currObject = { ...currObject, pos: pos, neg: neg }
                    result.push(currObject)
                }
                )
            )
            setItems(result)
            setLoading(false)

            // GetEntities(result)

        } catch (error) {
            console.error(error)
        }
    }


    const handleChange = (event) => {
        setEntities([])
        setFeed(event.target.value);
        const provider = event.target.value;
        GetNewsReports(provider);
    };

    return (
        <div className='dashboard-container'>
            <Navbar />
            <Box className="select-legend-wrapper" >
                <Box className="select-container">
                    <span className='select-heading'> Pick Feed Provider: </span>
                    <FormControl size='small' className='select-form'>
                        <InputLabel id="demo-simple-select-label">Select News Source</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={feed}
                            label="Select News Source"
                            onChange={handleChange}
                        >
                            <MenuItem value="cnbc">CNBC</MenuItem>
                            <MenuItem value="wsj">WSJ</MenuItem>
                            <MenuItem value="polygon">Polygon</MenuItem>
                            {/* <MenuItem value="yahoo">Yahoo</MenuItem> */}
                        </Select>
                    </FormControl>
                    <RefreshIcon onClick={() => { if (feed !== null) GetNewsReports(feed) }} sx={{ color: "dodgerblue" }} />
                </Box>

                <Box className="legend-container">
                    <Box className="legend"> <ProgressBar pos={100} neg={0} /> - Positive outlook</Box>
                    <Box className="legend"> <ProgressBar pos={0} neg={100} /> - Negative outlook</Box>
                    <Box className="legend"> <ProgressBar pos={0} neg={0} /> - Neutral outlook</Box>
                </Box>
            </Box>
            {
                !loading && items?.length === 0 ?
                    <Box className="empty-box">{'Choose a feed provider to view sentimental analysis of news articles.'} </Box> :
                    (loading ?
                        [1, 2, 3].map((e, i) => {
                            return <Box key={i} className="skeletons-container">
                                <Skeleton className='skeleton' animation="wave" variant="rectangular" height={100} />
                            </Box>
                        })
                        :
                        <Box className="items-container">
                            {items.map((item, i) => {
                                return <Box key={i} className="item-card">
                                    <span> {item?.text} </span>
                                    <Box className="subtext">
                                        <div className='date'> {item?.date} </div>
                                        {/* <div> {item?.emotion === "neutral" ? <SentimentNeutralIcon sx={{ color: "#f2b50c" }} />
                                            : (item?.emotion === "happy" ? 
                                                : )}
                                        </div> */}
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <MoodBadIcon sx={{ color: item?.neg == 0 ? "lightgrey" : "crimson" }} />
                                            <ProgressBar pos={parseInt(item?.pos)} neg={parseInt(item?.neg)} />
                                            <MoodIcon sx={{ color: item?.pos == 0 ? "lightgrey" : "green" }} />
                                        </Box>
                                    </Box>
                                    {/* <Box sx={{ display: "flex" }}>
                                        <b> Talks about:</b>

                                        {entities[i]?.map((e, index) => {
                                            return <Box>
                                                &nbsp;{e}
                                                {index < items.length - 1 ? "," : ""}
                                            </Box>
                                        })}
                                    </Box> */}
                                </Box>
                            })}
                        </Box>
                    )
            }


        </div>
    )
}