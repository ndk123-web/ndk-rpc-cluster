import ndk_load_balancer from '../index.mjs'

const add = ({ a, b }) => a + b;

const register_functions = [
    {
        function_name: "add",
        function_block: add
    }
]

let loadserver = new ndk_load_balancer({ port: 3000, replicas: 3, register_functions: register_functions })
loadserver.start()