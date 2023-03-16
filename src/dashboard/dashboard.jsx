import React, { useState } from 'react';
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
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';

export default function Dashboard() {
    const [feed, setFeed] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const GetNewsReports = async (provider) => {
        setLoading(true)
        try {
            const res = await axios.get(`https://biz-api.text-miner.com/finfeed/${provider}`)
            let result = [];
            await Promise.allSettled(
                JSON.parse(res.data).map(async (item, i) => {
                    if (i < 5) {
                        const itemArray = item.split("\t");
                        let emotion = "";
                        let currObject = {
                            text: itemArray[0],
                            date: itemArray[1],
                            emo: []
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
                        let neg = response.data.negative_sentiment_percentage;
                        let pos = response.data.positive_sentiment_percentage;
                        if (neg === pos) {
                            emotion = "neutral"
                        }
                        else if (neg > pos) {
                            emotion = "sad"
                        } else {
                            emotion = "happy"
                        }
                        currObject = { ...currObject, emotion: emotion }
                        result.push(currObject)
                    }
                })
            )
            setItems(result)
            setLoading(false)
            // let emoResult = [];
            // await Promise.allSettled(
            //     items.map(async (item) => {
            //         let currObject;
            //         const emoRes = await axios.post(
            //             'https://api.text-miner.com/ner',
            //             `message=${item.text}`,
            //             {
            //                 headers: {
            //                     'Content-Type': 'application/x-www-form-urlencoded'
            //                 }
            //             }
            //         )
            //         console.log(emoRes.data)
            //         currObject = { ...item, entities: emoRes.data }
            //         emoResult.push(currObject)
            //     })
            // )
            // setItems(emoResult)
        } catch (error) {
            console.error(error)
        }
    }


    const handleChange = (event) => {
        setFeed(event.target.value);
        const provider = event.target.value;
        GetNewsReports(provider);
    };

    return (
        <div className='dashboard-container'>
            <Navbar />

            <Box className="select-container">
                <span className='select-heading'> Pick Feed Provider: </span>
                <FormControl size='small' className='select-form'>
                    <InputLabel id="demo-simple-select-label">Select News Source</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={feed}
                        label="Age"
                        onChange={handleChange}
                    >
                        <MenuItem value="cnbc">CNBC</MenuItem>
                        <MenuItem value="wsj">WSJ</MenuItem>
                        <MenuItem value="yahoo">Yahoo</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {
                !loading && items.length === 0 ?
                    <Box className="empty-box">{'Choose a feed provider to view sentimental analysis of news articles.'} </Box> :
                    (loading ?
                        [1, 2, 3].map((e) => {
                            return <Box className="skeletons-container">
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
                                        <div> {item?.emotion === "neutral" ? <SentimentNeutralIcon sx={{ color: "#f2b50c" }} />
                                            : (item?.emotion === "happy" ? <MoodIcon sx={{ color: "green" }} />
                                                : <MoodBadIcon sx={{ color: "crimson" }} />)}
                                        </div>
                                    </Box>
                                    <Box sx={{ display: "flex" }}>
                                        Named entities: {item?.entities?.map((e) => {
                                            return <Box> {e} </Box>
                                        })}
                                    </Box>
                                </Box>
                            })}
                        </Box>
                    )
            }


        </div>
    )
}