# 🎯 HTML Table Parser for YouTube Influencers

Parse HTML tables containing YouTube influencer data and extract structured information.

## 🚀 Quick Start

```bash
# 1. Save your HTML to a file
nano influencers.html  # Paste your HTML table

# 2. Run the parser
./parse_influencers.sh influencers.html

# 3. Export to CSV (when prompted)
# Type 'y' to export
# Output will be saved as: influencers_parsed.csv
```

**Note:** The script requires an HTML file as input. It will automatically generate a CSV filename based on your input file.

## 📦 Requirements

```bash
# Install dependencies
pip install beautifulsoup4 lxml
```

## 📊 Data Extracted

For each influencer:
- **Rank** (1st, 2nd, 3rd, etc.)
- **Grade** (A, B+, C-, etc.)
- **Name** (Channel name)
- **Handle** (YouTube handle/URL)
- **Channel ID** (Unique YouTube ID)
- **Subscribers** (Both formatted "26.9M" and numeric 26,900,000)
- **Views** (Both formatted "21.18B" and numeric 21,180,000,000)
- **Videos** (Both formatted "6.21K" and numeric 6,210)
- **Image URL** (Profile picture URL)

## 📖 Usage

### Command Line

```bash
# Parse from file (required)
./parse_influencers.sh influencers.html

# Or use Python directly
python parse_html_table.py influencers.html

# The script will:
# 1. Parse the HTML file
# 2. Pretty print all influencers
# 3. Ask if you want to export to CSV
# 4. Save as: influencers_parsed.csv
```

### Python Module

```python
from parse_html_table import parse_html_table, export_to_csv

# Parse HTML
with open('influencers.html', 'r') as f:
    influencers = parse_html_table(f.read())

# Print all names
for inf in influencers:
    print(f"{inf['name']}: {inf['subscribers']}")

# Export to CSV
export_to_csv(influencers, 'output.csv')
```

## 🎨 Sample Output

```
================================================================================
INFLUENCER #1
================================================================================
Rank:        1st
Grade:       B+
Name:        Tibo InShape
Handle:      /youtube/handle/tiboinshape
Channel ID:  UCpWaR3gNAQGsX48cIlQC0qw
Subscribers: 26.9M (26,900,000)
Views:       21.18B (21,180,000,000)
Videos:      6.21K (6,210)
Image URL:   https://yt3.ggpht.com/...
================================================================================
```

## 💡 Examples

### Filter by Grade

```python
from parse_html_table import parse_html_table

with open('influencers.html', 'r') as f:
    influencers = parse_html_table(f.read())

# Filter top performers
top = [i for i in influencers if i['grade'] in ['A', 'A+', 'B+']]
print(f"Found {len(top)} top performers")
```

### Sort by Subscribers

```python
from parse_html_table import parse_html_table

with open('influencers.html', 'r') as f:
    influencers = parse_html_table(f.read())

# Sort by subscriber count
sorted_inf = sorted(influencers, 
                   key=lambda x: x['subscribers_num'], 
                   reverse=True)

for inf in sorted_inf[:10]:
    print(f"{inf['name']}: {inf['subscribers']}")
```

### Calculate Statistics

```python
from parse_html_table import parse_html_table

with open('influencers.html', 'r') as f:
    influencers = parse_html_table(f.read())

total_subs = sum(i['subscribers_num'] for i in influencers)
avg_subs = total_subs / len(influencers)

print(f"Total subscribers: {total_subs:,}")
print(f"Average subscribers: {avg_subs:,.0f}")
```

## 🔧 Features

- ✅ Parse HTML tables with BeautifulSoup
- ✅ Convert abbreviated numbers (26.9M → 26,900,000)
- ✅ Pretty print each influencer
- ✅ Export to CSV
- ✅ Use as Python module
- ✅ UTF-8 support for international characters
- ✅ Handle large datasets (100+ influencers)

## 📁 Files

- `parse_html_table.py` - Main parser script
- `parse_influencers.sh` - Helper script (auto-uses venv)
- `requirements.txt` - Python dependencies

## 🐛 Troubleshooting

### "No module named 'bs4'"

```bash
pip install beautifulsoup4 lxml
```

### "Virtual environment not found"

```bash
python -m venv .venv
source .venv/bin/activate
pip install beautifulsoup4 lxml
```

## ✅ Ready to Use!

```bash
./parse_influencers.sh your_file.html
```

🎉 Enjoy!
