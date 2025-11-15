#!/usr/bin/env python3
"""
Example usage of the HTML table parser
"""

from parse_html_table import parse_html_table, export_to_csv, pretty_print_influencer


def example_basic():
    """Basic example: Parse and display"""
    print("=" * 80)
    print("EXAMPLE 1: Basic Parsing")
    print("=" * 80)
    
    with open('sample.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    influencers = parse_html_table(html)
    print(f"\nParsed {len(influencers)} influencers")
    
    # Show first influencer
    if influencers:
        print("\nFirst influencer:")
        pretty_print_influencer(influencers[0])


def example_filter():
    """Filter influencers by criteria"""
    print("\n" + "=" * 80)
    print("EXAMPLE 2: Filter by Grade")
    print("=" * 80)
    
    with open('sample.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    influencers = parse_html_table(html)
    
    # Filter by grade
    top_grade = [i for i in influencers if i['grade'] in ['A', 'A+', 'B+']]
    
    print(f"\nFound {len(top_grade)} influencers with grade A, A+, or B+:")
    for inf in top_grade:
        print(f"  {inf['rank']} - {inf['name']}: {inf['grade']} ({inf['subscribers']})")


def example_sort():
    """Sort influencers"""
    print("\n" + "=" * 80)
    print("EXAMPLE 3: Sort by Subscribers")
    print("=" * 80)
    
    with open('sample.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    influencers = parse_html_table(html)
    
    # Sort by subscribers (descending)
    sorted_inf = sorted(influencers, key=lambda x: x['subscribers_num'], reverse=True)
    
    print("\nTop influencers by subscribers:")
    for i, inf in enumerate(sorted_inf, 1):
        print(f"  {i}. {inf['name']}: {inf['subscribers']} ({inf['subscribers_num']:,})")


def example_stats():
    """Calculate statistics"""
    print("\n" + "=" * 80)
    print("EXAMPLE 4: Statistics")
    print("=" * 80)
    
    with open('sample.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    influencers = parse_html_table(html)
    
    total_subs = sum(i['subscribers_num'] for i in influencers)
    total_views = sum(i['views_num'] for i in influencers)
    total_videos = sum(i['videos_num'] for i in influencers)
    
    avg_subs = total_subs / len(influencers)
    avg_views = total_views / len(influencers)
    
    print(f"\nTotal influencers: {len(influencers)}")
    print(f"Total subscribers: {total_subs:,}")
    print(f"Total views: {total_views:,}")
    print(f"Total videos: {total_videos:,}")
    print(f"\nAverage subscribers: {avg_subs:,.0f}")
    print(f"Average views: {avg_views:,.0f}")


def example_export():
    """Export to CSV"""
    print("\n" + "=" * 80)
    print("EXAMPLE 5: Export to CSV")
    print("=" * 80)
    
    with open('sample.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    influencers = parse_html_table(html)
    
    # Export all
    export_to_csv(influencers, 'all_influencers.csv')
    
    # Export filtered (>10M subscribers)
    mega = [i for i in influencers if i['subscribers_num'] > 10_000_000]
    if mega:
        export_to_csv(mega, 'mega_influencers.csv')


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("HTML TABLE PARSER - EXAMPLES")
    print("=" * 80)
    
    example_basic()
    example_filter()
    example_sort()
    example_stats()
    example_export()
    
    print("\n" + "=" * 80)
    print("All examples completed!")
    print("=" * 80)
