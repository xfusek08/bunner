# Detect bun and run it write pretty error when bun is not found

# Define colors
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if bun is installed
if ! command -v bun &> /dev/null
then
    echo -e "${RED}❌ bun could not be found${NC}"
    echo -e "💡 Please install bun by running '${RED}npm install -g bun${NC}'"
    exit
fi

# Run bun
bun $(dirname "$0")/entry.ts $@
