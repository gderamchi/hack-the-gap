#!/usr/bin/env python3
"""
HTML Table Parser - Extracts YouTube influencer data from HTML table
"""

from bs4 import BeautifulSoup
import re


def parse_number(text):
    """Convert abbreviated numbers (like 26.9M, 21.18B) to actual numbers"""
    text = text.strip()
    multipliers = {
        'K': 1_000,
        'M': 1_000_000,
        'B': 1_000_000_000
    }
    
    match = re.match(r'([\d.]+)([KMB])?', text)
    if match:
        number = float(match.group(1))
        suffix = match.group(2)
        if suffix:
            return int(number * multipliers[suffix])
        return int(number)
    return text


def parse_html_table(html_content):
    """Parse HTML table and extract influencer data"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all table rows in tbody
    rows = soup.find('tbody').find_all('tr')
    
    influencers = []
    
    for row in rows:
        cells = row.find_all('td')
        
        if len(cells) >= 6:
            # Extract data from each cell
            rank = cells[0].get_text(strip=True)
            grade = cells[1].get_text(strip=True)
            
            # Extract name and image URL
            name_cell = cells[2]
            name = name_cell.find('span').get_text(strip=True) if name_cell.find('span') else ''
            img_tag = name_cell.find('img')
            image_url = img_tag['src'] if img_tag else ''
            
            # Extract handle/channel URL
            link = name_cell.find('a')
            handle = link['href'] if link else ''
            
            # Extract channel ID from row
            channel_id = row.get('id', '')
            
            # Extract metrics
            subscribers = cells[3].get_text(strip=True)
            views = cells[4].get_text(strip=True)
            videos = cells[5].get_text(strip=True)
            
            influencer = {
                'rank': rank,
                'grade': grade,
                'name': name,
                'handle': handle,
                'channel_id': channel_id,
                'image_url': image_url,
                'subscribers': subscribers,
                'subscribers_num': parse_number(subscribers),
                'views': views,
                'views_num': parse_number(views),
                'videos': videos,
                'videos_num': parse_number(videos)
            }
            
            influencers.append(influencer)
    
    return influencers


def pretty_print_influencer(influencer, index=None):
    """Pretty print a single influencer's data"""
    separator = "=" * 80
    
    if index is not None:
        print(f"\n{separator}")
        print(f"INFLUENCER #{index + 1}")
    print(separator)
    
    print(f"Rank:        {influencer['rank']}")
    print(f"Grade:       {influencer['grade']}")
    print(f"Name:        {influencer['name']}")
    print(f"Handle:      {influencer['handle']}")
    print(f"Channel ID:  {influencer['channel_id']}")
    print(f"Subscribers: {influencer['subscribers']} ({influencer['subscribers_num']:,})")
    print(f"Views:       {influencer['views']} ({influencer['views_num']:,})")
    print(f"Videos:      {influencer['videos']} ({influencer['videos_num']:,})")
    print(f"Image URL:   {influencer['image_url']}")
    print(separator)


def export_to_csv(influencers, filename='parsed_influencers.csv'):
    """Export influencers data to CSV"""
    import csv
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['rank', 'grade', 'name', 'handle', 'channel_id', 
                         'subscribers', 'subscribers_num', 'views', 'views_num', 
                         'videos', 'videos_num', 'image_url']
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            
            writer.writeheader()
            
            # Write each influencer, ensuring all values are properly formatted
            for influencer in influencers:
                row = {}
                for field in fieldnames:
                    value = influencer.get(field, '')
                    # Convert numeric values to strings for CSV
                    if isinstance(value, (int, float)):
                        row[field] = str(value)
                    else:
                        row[field] = value
                writer.writerow(row)
        
        print(f"\n✓ Exported {len(influencers)} influencers to {filename}")
        return True
    except Exception as e:
        print(f"\n✗ Error exporting to CSV: {e}")
        return False


def main():
    """Main function to read HTML and parse table"""
    import sys
    import os
    
    # Require HTML file as argument
    if len(sys.argv) < 2:
        print("Usage: python parse_html_table.py <html_file>")
        print("\nExample:")
        print("  python parse_html_table.py influencers.html")
        print("  ./parse_influencers.sh influencers.html")
        sys.exit(1)
    
    html_file = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(html_file):
        print(f"Error: File '{html_file}' not found")
        sys.exit(1)
    
    # Read HTML file
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    # Parse the table
    try:
        influencers = parse_html_table(html_content)
    except Exception as e:
        print(f"Error parsing HTML: {e}")
        sys.exit(1)
    
    if not influencers:
        print("No influencers found in the HTML file")
        sys.exit(1)
    
    # Pretty print each influencer
    for i, influencer in enumerate(influencers):
        pretty_print_influencer(influencer, i)
    
    # Print summary
    print(f"\n{'=' * 80}")
    print(f"SUMMARY: Parsed {len(influencers)} influencers")
    print(f"{'=' * 80}")
    
    # Ask if user wants to export to CSV
    try:
        export = input("\nExport to CSV? (y/n): ").strip().lower()
        if export == 'y':
            # Generate output filename based on input filename
            base_name = os.path.splitext(html_file)[0]
            csv_filename = f"{base_name}_parsed.csv"
            export_to_csv(influencers, csv_filename)
    except (EOFError, KeyboardInterrupt):
        print("\n\nSkipping CSV export.")


if __name__ == "__main__":
    main()
