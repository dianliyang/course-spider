import argparse
from scrapers.mit import MIT
from scrapers.stanford import Stanford
from scrapers.cmu import CMU
from scrapers.ucb import UCB

def main():
    parser = argparse.ArgumentParser(description="Scrape course data for a university")
    parser.add_argument("uni", choices=["cmu", "mit", "stanford", "ucb"], help="University to scrape")
    args = parser.parse_args()
    
    scraper = None
    if args.uni == "cmu":
        scraper = CMU()
    elif args.uni == "mit":
        scraper = MIT()
    elif args.uni == "stanford":
        scraper = Stanford()
    elif args.uni == "ucb":
        scraper = UCB()
        
    if scraper:
        scraper.save()

if __name__ == "__main__":
    main()
