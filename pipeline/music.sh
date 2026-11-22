#!/bin/sh
# Period music for the Chapter openings: sixteen seconds of each approved recording, levelled
# and faded. The recordings are in the public domain; their pages on Wikimedia Commons are
# given in src/journey/content/music.ts and on the Sources page.
#
#   sh pipeline/music.sh        (needs curl and ffmpeg)
set -e
cd "$(dirname "$0")/.."
work=.work/music
out=public/media/musique
commons=https://upload.wikimedia.org/wikipedia/commons
mkdir -p "$work" "$out"

# chapter | file kept in .work | where the music starts, in seconds | original
while IFS='|' read -r chapter file from url; do
  [ -f "$work/$file" ] || { curl -sL -A "andre-schlegel-site/1.0" -o "$work/$file" "$commons/$url"; sleep 3; }
  ffmpeg -v error -y -ss "$from" -i "$work/$file" -t 16 \
    -af "loudnorm=I=-18:TP=-2:LRA=11,afade=t=in:d=0.2,afade=t=out:st=14.2:d=1.8" \
    -ar 44100 -c:a aac -b:a 112k -movflags +faststart "$out/$chapter.m4a"
  echo "$out/$chapter.m4a"
done <<'LIST'
tours|lorraine.ogg|0.8|0/01/Odeon-303277.ogg
algerie|sambre.ogg|0.8|a/a9/Odeon-303278.ogg
campagne-de-france|sambre-chante.ogg|0.3|1/1a/Beaufort_regiment_de_sambre_et_1909_cd_1001.ogg
ecole-anglaise|scotland.oga|0|5/52/Scotland_the_Brave_-_United_States_Air_Force_Pipe_Band.oga
elvington|pomp.mp3|2.3|2/28/ELGAR_Pomp_and_Circumstance_in_D%2C_Opus_39%2C_No._1_-_United_States_Marine_Band.mp3
apres-la-guerre|marseillaise.ogg|0|3/30/La_Marseillaise.ogg
LIST
