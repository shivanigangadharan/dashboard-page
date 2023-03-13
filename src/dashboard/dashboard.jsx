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

export default function Dashboard() {
    const [feed, setFeed] = useState('');
    const [items, setItems] = useState([]);

    const GetNewsReports = async (provider) => {
        try {
            const res = await axios.get(`https://biz-api.text-miner.com/finfeed/${provider}`)
            let result = [];
            JSON.parse(res.data).map(async (item, i) => {
                console.log("waiting")
                if (i < 5) {
                    const itemArray = item.split("\t");
                    let emotion = "";
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
                    let neg = response.data.negative_sentiment_percentage;
                    let pos = response.data.positive_sentiment_percentage;
                    if (neg > pos) {
                        emotion = "Happy"
                    } else {
                        emotion = "Sad"
                    }
                    currObject = { ...currObject, emotion: emotion }
                    result.push(currObject)
                    console.log('co: ', currObject)
                }
            })
            console.log("result array: ", result)
            setItems(result)
        } catch (error) {
            console.error(error)
        }
    }


    const handleChange = (event) => {
        setFeed(event.target.value);
        const provider = event.target.value;
        GetNewsReports(provider);
    };

    console.log("items: ", items)

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
            <Box className="items-container">
                {items.map((item, i) => {
                    return <Box key={i} className="item-card">
                        <span> {item?.text} </span>
                        <Box className="subtext">
                            <div className='date'> {item?.date} </div>
                            <div> {item?.emotion} </div>
                        </Box>
                        <Box>
                            Named entities:
                        </Box>
                    </Box>
                })}

            </Box>

        </div>
    )
}