import axios from 'axios';
import * as cheerio from 'cheerio';

interface F1Driver {
  givenName: string;
  familyName: string;
}

interface F1Constructor {
  constructorId: string;
  name: string;
}

interface F1Time {
  time: string;
}

export interface F1ClassificationResult {
  position: string;
  Driver: F1Driver;
  Constructor: F1Constructor;
  Time?: F1Time;
  Q1?: string;
  Q2?: string;
  Q3?: string;
  status: string;
  points: string;
}

const getHtmlText = (html: string): string[] => {
    const $ = cheerio.load(html);
    const texts: string[] = [];
    const traverse = (node: any) => {
        if (node.type === 'text') {
            const t = $(node).text().trim();
            if (t && t !== ' ') texts.push(t);
        } else if (node.type === 'tag') {
            if (node.name === 'a') {
                const href = $(node).attr('href');
                if (href && href.includes('/races/')) {
                    texts.push(`HREF=${href}`);
                }
            }
            $(node).contents().each((_, child) => traverse(child));
        }
    };
    traverse($('body')[0]);
    return texts;
};

const getRaceUrlPrefix = async (season: string, round: string): Promise<string | null> => {
    try {
        const res = await axios.get(`https://www.formula1.com/en/results.html/${season}/races.html`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const texts = getHtmlText(res.data);
        
        const raceUrls: string[] = [];
        for (let i = 0; i < texts.length; i++) {
            if ((texts[i] || "").startsWith('HREF=') && (texts[i] || "").endsWith('/race-result')) {
                const url = (texts[i] || "").replace('HREF=', '');
                if (!raceUrls.includes(url)) {
                    raceUrls.push(url);
                }
            }
        }
        
        const roundNum = parseInt(round);
        if (!isNaN(roundNum) && roundNum >= 1 && roundNum <= raceUrls.length) {
            const fullUrl = raceUrls[roundNum - 1]; 
            return (fullUrl || "").split('/race-result')[0] || null;
        }

        return null;
    } catch (e) {
        console.error('Error fetching F1.com race index:', e);
        return null;
    }
}

export const getF1SessionResults = async (season: string, round: string, session: 'practice-1' | 'practice-2' | 'practice-3' | 'qualifying' | 'race-result'): Promise<F1ClassificationResult[] | null> => {
    try {
        const urlPrefix = await getRaceUrlPrefix(season, round);
        if (!urlPrefix) return null;

        const sessionUrl = `https://www.formula1.com${urlPrefix.replace('/results/', '/results.html/')}/${session}.html`;
        console.log('Scraping F1.com:', sessionUrl);
        
        const res = await axios.get(sessionUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            validateStatus: () => true
        });

        if (res.status !== 200) {
            console.log("Status not 200:", res.status);
            return null; // Session likely hasn't happened yet
        }

        const texts = getHtmlText(res.data);
        
        let startIndex = -1;
        for (let i = 0; i < texts.length; i++) {
            if ((texts[i] || "") === 'Pos.' && texts[i+1] === 'No.' && texts[i+2] === 'Driver') {
                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) {
            console.log("Header not found");
            return null;
        }

        let headerEnd = startIndex + 1;
        while (headerEnd < texts.length && isNaN(parseInt((texts[headerEnd] || "")))) {
            headerEnd++;
        }

        const results: F1ClassificationResult[] = [];
        
        let i = headerEnd;
        while (i < texts.length) {
            const pos = texts[i];
            if (isNaN(parseInt(pos || "")) && (pos || "") !== 'NC' && (pos || "") !== 'DQ' && (pos || "") !== 'RT') {
                break; // End of table
            }
            
            const position = pos;
            i++;
            const number = texts[i]; i++;
            const firstName = texts[i]; i++;
            const lastName = texts[i]; i++;
            const tla = texts[i]; i++;
            
            let teamName = '';
            while (i < texts.length) {
                const peek = texts[i];
                if ((peek || "").match(/^[+0-9]/) || peek === 'DNF' || peek === 'DNS' || peek === 'NC' || peek === 'DQ') {
                    break;
                }
                teamName += peek + ' ';
                i++;
            }
            teamName = teamName.trim();
            
            const rowValues = [];
            while (i < texts.length) {
                const peek = texts[i];
                const nextPosNum = parseInt(position || "") + 1;
                
                // End of row detection
                if (peek === nextPosNum.toString() || peek === 'NC' || peek === 'DQ' || peek === 'RT') {
                    const peekNext = parseInt(texts[i+1] || "");
                    const peekNextNext = parseInt(texts[i+2] || "");
                    if (!isNaN(peekNext) && peekNext > 0 && peekNext < 100 && isNaN(peekNextNext)) {
                        break;
                    }
                }
                rowValues.push(peek);
                i++;
            }

            let timeStr = '';
            let q1, q2, q3;
            let points = '0';
            let status = 'Finished';

            if (session === 'qualifying') {
                q1 = (rowValues[0] || "");
                if (rowValues[1] && rowValues[1].includes(':')) q2 = rowValues[1];
                if (rowValues[2] && rowValues[2].includes(':')) q3 = rowValues[2];
            } else if (session === 'race-result') {
                timeStr = (rowValues[0] || "");
                if (['DNF', 'DNS', 'NC'].includes(timeStr)) {
                    status = timeStr;
                    timeStr = '';
                }
                const ptsRaw = rowValues[rowValues.length - 1];
                if (!isNaN(parseInt(ptsRaw || ""))) points = ptsRaw || "";
            } else {
                timeStr = (rowValues[0] || "");
                if (['DNF', 'DNS', 'NC'].includes(timeStr)) {
                    status = timeStr;
                    timeStr = '';
                }
            }

            results.push({
                position: position || "",
                Driver: { givenName: firstName || "", familyName: lastName || "" },
                Constructor: { constructorId: teamName.toLowerCase().replace(/\s/g, '_'), name: teamName },
                Time: timeStr ? { time: timeStr } : undefined,
                Q1: q1, Q2: q2, Q3: q3,
                status,
                points
            });
        }
        
        return results.length > 0 ? results : null;
    } catch (e) {
        console.error('F1 scraper error:', e);
        return null;
    }
}
