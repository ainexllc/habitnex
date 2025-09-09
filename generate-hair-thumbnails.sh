#!/bin/bash

# Script to generate hair style thumbnails using DiceBear API
# This will create preview images for all available hair styles

echo "Generating hair style thumbnails..."

# Create thumbnails directory
mkdir -p public/hair-thumbnails

# Short hair styles
short_hairs=("short01" "short02" "short03" "short04" "short05" "short06" "short07" "short08" "short09" "short10" "short11" "short12" "short13" "short14" "short15" "short16")

# Long hair styles  
long_hairs=("long01" "long02" "long03" "long04" "long05" "long06" "long07" "long08" "long09" "long10" "long11" "long12" "long13" "long14" "long15" "long16" "long17" "long18" "long19" "long20" "long21" "long22" "long23" "long24" "long25" "long26")

echo "Generating short hair thumbnails..."
for hair in "${short_hairs[@]}"; do
    echo "Generating $hair..."
    curl -s "https://api.dicebear.com/9.x/adventurer/svg?seed=$hair&hair=$hair&size=64" > "public/hair-thumbnails/$hair.svg"
done

echo "Generating long hair thumbnails..."
for hair in "${long_hairs[@]}"; do
    echo "Generating $hair..."
    curl -s "https://api.dicebear.com/9.x/adventurer/svg?seed=$hair&hair=$hair&size=64" > "public/hair-thumbnails/$hair.svg"
done

echo "Thumbnails generated successfully!"
echo "Total short hair styles: ${#short_hairs[@]}"
echo "Total long hair styles: ${#long_hairs[@]}"
echo "Thumbnails saved to: public/hair-thumbnails/"