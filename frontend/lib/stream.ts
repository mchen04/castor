export async function* sseEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<Record<string,unknown>> {
  const reader=stream.getReader(); const decoder=new TextDecoder(); let buffer='';
  try { while(true) {
    const {value,done}=await reader.read(); buffer+=decoder.decode(value,{stream:!done});
    let newline;
    while((newline=buffer.indexOf('\n'))>=0) {
      const line=buffer.slice(0,newline).trimEnd(); buffer=buffer.slice(newline+1);
      if(line.startsWith('data:')) { const data=line.slice(5).trim(); if(data && data!=='[DONE]') yield JSON.parse(data); }
    }
    if(buffer.length>200000) throw new Error('Invalid oversized provider event.');
    if(done) break;
  } } finally { await reader.cancel().catch(()=>{}); reader.releaseLock(); }
}
